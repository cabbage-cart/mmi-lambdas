require('dotenv').config()

const fetch = require('./fetch')

const async = require('async')

const lambda_enpoint = (JSON.parse(process.env.PRODUCTION)) ? process.env.PRODUCTION_LAMBDA_ENDPOINT : process.env.DEVELOPMENT_LAMBDA_ENDPOINT
const source_enpoint = (JSON.parse(process.env.PRODUCTION)) ? process.env.PRODUCTION_SOURCE_ENDPOINT : process.env.DEVELOPMENT_SOURCE_ENDPOINT

const event = {}
event.url = null
event.headers = {
    "Authorization": "Bearer "+process.env.BEARER_TOKEN
}

const crawlArticleFunc = async () => {
    try {
    
        let checkOpts = {
            url: source_enpoint+'article/count',
            method: "POST",
            body: {
                article_status: "Queued"
            }
        }

        let countQ = await fetch(checkOpts.url, checkOpts.method, event.headers, checkOpts.body)
        console.log(countQ)
        event.url = source_enpoint+"article?article_status=Queued&limit="+countQ.data.result
        // event.url = source_enpoint+"article?article_status=Queued&limit=10"
        event.method = "GET"
        event.headers['Content-type'] = 'application/json'
        let result = await fetch(event.url, event.method, event.headers)
        let mapUrls = result.data.map(v=>{
            return {
                article_id: v._id,
                url: lambda_enpoint+"article/"+v._id,
                method: "PUT",
                headers: event.headers,
                body: {
                    article_url: v.article_url,
                    ...v.website
                }
            }
        })
        // console.log(mapUrls)

        let taskQ = async.queue(function (task, callback) {
            let ms = Math.floor(Math.random() * 1000) + 5000
            console.log(task.name.article_id)
            console.log('Processing',task.name.body.article_url, ms)
            console.log('Size', taskQ.length())
            console.log()
            setTimeout(async () => {
                fetch(task.name.url, task.name.method, task.name.headers, task.name.body)
                .then(async d=>{
                    if(typeof d === 'object'){
                        console.log(d)
                    }else{
                        let updateOpts = {
                            url: source_enpoint+'article/'+task.name.article_id,
                            method: "PUT",
                            body: {
                                article_status: "Error",
                                date_updated: new Date(),
                                article_error_status: d
                            }
                        }
                        // console.log(updateOpts)
                        let u = await fetch(updateOpts.url, updateOpts.method, event.headers, updateOpts.body)
                        console.log(u)
                    }
                    callback()
                }).catch(e=>{
                    console.log('E',e)
                    callback()
                })
            }, ms);

        }, 10)
        taskQ.drain = function (){
            console.log('Done.')
        }
        mapUrls.forEach(element => {
            taskQ.push({name:element}, function(err){
                if(err){
                    console.log(err)
                }
            })
        });
    } catch (error) {
        console.error(error)
    }
}

// crawlArticleFunc()