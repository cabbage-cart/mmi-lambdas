const { url_helper, html_helper, article_helper, media_value_helper, transaction_helper} = require('../../mmi_modules')
const { $string, $moment, $franc } = require('../../mmi_modules/npm_mods')
const { nextTick } = require('async')


module.exports = function(name, router){

    router.get(name, function(req, res, next){

        res.status(200).send('Article lambda endpoint.')

    })

    router.post(name+'/test_article', async function(req, res, next){
        try {
            
            const _req_url = (req.body.url.indexOf('%') != -1) ? decodeURI(req.body.url) : req.body.url 

            const request_source = req.body.request_source

            const home_url = req.body.website_url

            const includeSearch = req.body.needs_search_params
            
            const startHttps = req.body.needs_https

            const endSlash = req.body.needs_endslash

            const selectors = req.body.selectors

            const code = req.body.code_snippet

            const is_using_selectors = JSON.parse(req.body.is_using_selectors)

            const is_using_snippets = JSON.parse(req.body.is_using_snippets)

            const website_cost = req.body.website_cost

            const global_rank = req.body.global_rank

            const local_rank = req.body.local_rank

            const _uri = new url_helper(_req_url, request_source, includeSearch, startHttps, endSlash)

            const _uri_response = await _uri.MAKE_REQUEST()

            const url = await _uri.FORMATTED_URL()

            const _htm = new html_helper(_uri_response, home_url, includeSearch, startHttps, endSlash)

            const _raw_html = await _htm.HTML()

            if(is_using_selectors){

                const _article = new article_helper(_raw_html, selectors)

                const title = await _article.ARTICLE_TITLE()

                const date = await _article.ARTICLE_PUBLISH()

                const author = await _article.ARTICLE_AUTHOR()

                const section = await _article.ARTICLE_SECTION()

                const html = await _article.ARTICLE_HTML()

                const text = await _article.ARTICLE_TEXT()

                const image = await _article.ARTICLE_IMAGE()

                const video = await _article.ARTICLE_VIDEO()

                const values = await media_value_helper(global_rank, local_rank, website_cost, text, image, video)

                const advalue = values.advalue

                const prvalue = values.prvalue

                const language = $franc(text)

                const data = {url, title, date, author, section, html, text, image, video, advalue, prvalue, language}

                res.status(200).send(data)

            }else if(is_using_snippets){

                const Snippet = module.exports = Function(code)()

                const _article = new Snippet(_raw_html, $string, $moment, url)

                const title = await _article.ARTICLE_TITLE()

                const date = await _article.ARTICLE_PUBLISH()

                const author = await _article.ARTICLE_AUTHOR()

                const section = await _article.ARTICLE_SECTION()

                const html = await _article.ARTICLE_HTML()

                const text = await _article.ARTICLE_TEXT()

                const image = await _article.ARTICLE_IMAGE()

                const video = await _article.ARTICLE_VIDEO()

                const values = await media_value_helper(global_rank, local_rank, website_cost, text, image, video)
                
                const advalue = values.advalue

                const prvalue = values.prvalue

                const language = $franc(text)

                const data = {url, title, date, author, section, html, text, image, video, advalue, prvalue, language}

                res.status(200).send(data)

            }else{

                next('Selectors and Snippets are not configured!')

            }


        } catch (error) {
            // if(error.hasOwnProperty('stack')){
            //     res.status(500).send(error.stack)
            // }else{
            //     res.status(500).send(error)
            // }
            console.log(error)

            next(error)
            
        }

    })

    router.post(name+'/store', async function(req, res, next){

        try {
            let _article_url = (req.body.article_url.indexOf('%') != -1 ) ? decodeURI(req.body.article_url) : req.body.article_url

            let check_if_exist = await transaction_helper.CHECK_DOMAIN(_article_url)

            if(check_if_exist.data > 0){

                let get_website = await transaction_helper.GET_WEBSITE(_article_url)

                let urlHelper = new url_helper(_article_url, get_website.request_source, get_website.needs_search_params, get_website.needs_https, get_website.needs_endslash)

                let clean_url = await urlHelper.FORMATTED_URL()

                req.body.website = get_website._id

                req.body.article_source_url = get_website.fqdn

                req.body.article_url = clean_url                

                let check_article = await transaction_helper.CHECK_ARTICLE(clean_url, req.body.article_status || 'Done')

                if(!req.body.hasOwnProperty('section')){

                    let check_section = await transaction_helper.CHECK_SECTION(get_website.website_url)

                    if(check_section.data > 0){

                        let get_section = await transaction_helper.GET_SECTION(get_website.website_url)

                        req.body.section = get_section._id

                    }else{

                        req.body.section_url = get_website.website_url

                        req.body.website = get_website._id

                        let storeSection = await transaction_helper.STORE_SECTION(req)

                        req.body.section = storeSection.data._id

                    }

                }
    
                if(check_article.data > 0){

                    res.status(500).send({

                        error: 'Article is already found!',

                        error_status: 'Exists!'

                    })
                }else{

                    // if(req.body.hasOwnProperty('website')){

                    const request_source = get_website.request_source

                    const home_url = get_website.website_url

                    const includeSearch = get_website.needs_search_params
                    
                    const startHttps = get_website.needs_https

                    const endSlash = get_website.needs_endslash

                    const selectors = get_website.selectors

                    const code = get_website.code_snippet

                    const is_using_selectors = JSON.parse(get_website.is_using_selectors)

                    const is_using_snippets = JSON.parse(get_website.is_using_snippets)

                    const website_cost = get_website.website_cost

                    const global_rank = get_website.alexa_rankings.global

                    const local_rank = get_website.alexa_rankings.local

                    const _uri = new url_helper(clean_url, request_source, includeSearch, startHttps, endSlash)

                    const _uri_response = await _uri.MAKE_REQUEST()

                    const url = await _uri.FORMATTED_URL()

                    const _htm = new html_helper(_uri_response, home_url, includeSearch, startHttps, endSlash)

                    const _raw_html = await _htm.HTML()

                    if(is_using_selectors){

                        const _article = new article_helper(_raw_html, selectors)

                        const title = await _article.ARTICLE_TITLE()

                        const date = await _article.ARTICLE_PUBLISH()

                        const author = await _article.ARTICLE_AUTHOR()

                        const section = await _article.ARTICLE_SECTION()

                        // const html = await _article.ARTICLE_HTML()

                        const text = await _article.ARTICLE_TEXT()

                        const image = await _article.ARTICLE_IMAGE()

                        const video = await _article.ARTICLE_VIDEO()

                        const values = await media_value_helper(global_rank, local_rank, website_cost, text, image, video)

                        const advalue = values.advalue

                        const prvalue = values.prvalue

                        // const data = {url, title, date, author, section, html, text, image, video, advalue, prvalue}

                        // res.status(200).send(data)

                        req.body.article_url = url

                        req.body.article_title = title

                        req.body.article_authors = author

                        req.body.article_publish_date = date

                        req.body.article_sections = section

                        req.body.article_content = text

                        req.body.article_images = image

                        req.body.article_videos = video

                        req.body.article_ad_value = advalue

                        req.body.article_pr_value = prvalue

                        req.body.article_status = 'Done'

                        req.body.article_language = $franc(text)

                    }else if(is_using_snippets){

                        const Snippet = module.exports = Function(code)()

                        const _article = new Snippet(_raw_html, $string, $moment, url)

                        const title = await _article.ARTICLE_TITLE()

                        const date = await _article.ARTICLE_PUBLISH()

                        const author = await _article.ARTICLE_AUTHOR()

                        const section = await _article.ARTICLE_SECTION()

                        // const html = await _article.ARTICLE_HTML()

                        const text = await _article.ARTICLE_TEXT()

                        const image = await _article.ARTICLE_IMAGE()

                        const video = await _article.ARTICLE_VIDEO()

                        const values = await media_value_helper(global_rank, local_rank, website_cost, text, image, video)
                        
                        const advalue = values.advalue

                        const prvalue = values.prvalue

                        // const data = {url, title, date, author, section, html, text, image, video, advalue, prvalue}

                        // res.status(200).send(data)


                        req.body.article_url = url

                        req.body.article_title = title

                        req.body.article_authors = author

                        req.body.article_publish_date = date

                        req.body.article_sections = section

                        req.body.article_content = text

                        req.body.article_images = image

                        req.body.article_videos = video

                        req.body.article_ad_value = advalue

                        req.body.article_pr_value = prvalue

                        req.body.article_status = 'Done'

                        req.body.article_language = $franc(text)

                    }else{

                        // next('Selectors and Snippets are not configured!')
                        res.status(500).send({

                            error: 'Selectors and Snippets are not configured!',
        
                            error_status: 'Parser Issue!'
        
                        })

                    }

                    // }

                    let data = await transaction_helper.STORE_ARTICLE(req)

                    res.status(200).send(data)

                }
                
            }else{

                res.status(500).send({

                    error: 'Website of this article is not in our monitoring',

                    error_status: 'Not Found!'

                })
            }
        } catch (error) {
            next(error)

        }

    })

    router.put(name+'/:id', async function(req, res, next){
        try {

            let body = {}
            
            const request_source = req.body.request_source

            const home_url = req.body.website_url

            const includeSearch = req.body.needs_search_params
            
            const startHttps = req.body.needs_https

            const endSlash = req.body.needs_endslash

            const selectors = req.body.selectors

            const code = req.body.code_snippet

            const is_using_selectors = JSON.parse(req.body.is_using_selectors)

            const is_using_snippets = JSON.parse(req.body.is_using_snippets)

            const website_cost = req.body.website_cost

            const global_rank = req.body.alexa_rankings.global

            const local_rank = req.body.alexa_rankings.local

            const _uri = new url_helper(req.body.article_url, request_source, includeSearch, startHttps, endSlash)

            const _uri_response = await _uri.MAKE_REQUEST()

            const url = await _uri.FORMATTED_URL()

            const _htm = new html_helper(_uri_response, home_url, includeSearch, startHttps, endSlash)

            const _raw_html = await _htm.HTML()

            if(is_using_selectors){

                const _article = new article_helper(_raw_html, selectors)

                const title = await _article.ARTICLE_TITLE()

                const date = await _article.ARTICLE_PUBLISH()

                const author = await _article.ARTICLE_AUTHOR()

                const section = await _article.ARTICLE_SECTION()

                // const html = await _article.ARTICLE_HTML()

                const text = await _article.ARTICLE_TEXT()

                const image = await _article.ARTICLE_IMAGE()

                const video = await _article.ARTICLE_VIDEO()

                const values = await media_value_helper(global_rank, local_rank, website_cost, text, image, video)

                const advalue = values.advalue

                const prvalue = values.prvalue

                body.article_url = url

                body.article_title = title

                body.article_authors = author

                body.article_publish_date = date

                body.article_sections = section

                body.article_content = text

                body.article_images = image

                body.article_videos = video

                body.article_ad_value = advalue

                body.article_pr_value = prvalue

                body.article_status = 'Done'

                body.article_language = $franc(text)

            }else if(is_using_snippets){

                const Snippet = module.exports = Function(code)()

                const _article = new Snippet(_raw_html, $string, $moment, url)

                const title = await _article.ARTICLE_TITLE()

                const date = await _article.ARTICLE_PUBLISH()

                const author = await _article.ARTICLE_AUTHOR()

                const section = await _article.ARTICLE_SECTION()

                // const html = await _article.ARTICLE_HTML()

                const text = await _article.ARTICLE_TEXT()

                const image = await _article.ARTICLE_IMAGE()

                const video = await _article.ARTICLE_VIDEO()

                const values = await media_value_helper(global_rank, local_rank, website_cost, text, image, video)
                
                const advalue = values.advalue

                const prvalue = values.prvalue

                body.article_url = url

                body.article_title = title

                body.article_authors = author

                body.article_publish_date = date

                body.article_sections = section

                body.article_content = text

                body.article_images = image

                body.article_videos = video

                body.article_ad_value = advalue

                body.article_pr_value = prvalue

                body.article_status = 'Done'

                body.article_language = $franc(text)

            }else{

                res.status(500).send({

                    error: 'Selectors and Snippets are not configured!',

                    error_status: 'Parser Issue!'

                })

            }

            body.date_updated = new Date()

            let data = await transaction_helper.UPDATE_ARTICLE(req.params.id, body)

            res.status(200).send(data)

        } catch (error) {
            await transaction_helper.UPDATE_ARTICLE(req.params.id, {
                article_status: "Error",
                date_updated: new Date(),
                article_error_status: error
            })
            next(error)

        }

    })

    router.post(name+'/media_values', async function(req, res, next){
        try {
            const { global, local, website_cost, text, images, videos } = req.body
            const alexa = await media_value_helper( global, local, website_cost, text, images, videos)
            res.status(200).send({'data': alexa})
        } catch (error) {
            next(error)
        }
    })

    router.post(name+'/parse_article', async function(req, res, next) {
        console.log('Article', req.body.article_url)
        try {
            let _article_url = (req.body.article_url.indexOf('%') != -1 ) ? decodeURI(req.body.article_url) : req.body.article_url

            let check_if_exist = await transaction_helper.CHECK_DOMAIN(_article_url)

            if(check_if_exist.data > 0){

                let get_website = await transaction_helper.GET_WEBSITE(_article_url)

                let urlHelper = new url_helper(_article_url, get_website.request_source, get_website.needs_search_params, get_website.needs_https, get_website.needs_endslash)

                let clean_url = await urlHelper.FORMATTED_URL()

                req.body.website = get_website._id

                req.body.article_source_url = get_website.fqdn

                req.body.article_url = clean_url                

                if(!req.body.hasOwnProperty('section')){

                    let check_section = await transaction_helper.CHECK_SECTION(get_website.website_url)

                    if(check_section.data > 0){

                        let get_section = await transaction_helper.GET_SECTION(get_website.website_url)

                        req.body.section = get_section._id

                    }else{

                        req.body.section_url = get_website.website_url

                        req.body.website = get_website._id

                        let storeSection = await transaction_helper.STORE_SECTION(req)

                        req.body.section = storeSection.data._id

                    }

                }

                const request_source = get_website.request_source

                const home_url = get_website.website_url

                const includeSearch = get_website.needs_search_params
                
                const startHttps = get_website.needs_https

                const endSlash = get_website.needs_endslash

                const selectors = get_website.selectors

                const code = get_website.code_snippet

                const is_using_selectors = JSON.parse(get_website.is_using_selectors)

                const is_using_snippets = JSON.parse(get_website.is_using_snippets)

                const website_cost = get_website.website_cost

                const global_rank = get_website.alexa_rankings.global

                const local_rank = get_website.alexa_rankings.local

                const _uri = new url_helper(clean_url, request_source, includeSearch, startHttps, endSlash)

                const _uri_response = await _uri.MAKE_REQUEST()

                const url = await _uri.FORMATTED_URL()

                const _htm = new html_helper(_uri_response, home_url, includeSearch, startHttps, endSlash)

                const _raw_html = await _htm.HTML()

                if(is_using_selectors){

                    const _article = new article_helper(_raw_html, selectors)

                    const title = await _article.ARTICLE_TITLE()

                    const date = await _article.ARTICLE_PUBLISH()

                    const author = await _article.ARTICLE_AUTHOR()

                    const section = await _article.ARTICLE_SECTION()

                    // const html = await _article.ARTICLE_HTML()

                    const text = await _article.ARTICLE_TEXT()

                    const image = await _article.ARTICLE_IMAGE()

                    const video = await _article.ARTICLE_VIDEO()

                    const values = await media_value_helper(global_rank, local_rank, website_cost, text, image, video)

                    const advalue = values.advalue

                    const prvalue = values.prvalue

                    // const data = {url, title, date, author, section, html, text, image, video, advalue, prvalue}

                    // res.status(200).send(data)

                    req.body.article_url = url

                    req.body.article_title = title

                    req.body.article_authors = author

                    req.body.article_publish_date = date

                    req.body.article_sections = section

                    req.body.article_content = text

                    req.body.article_images = image

                    req.body.article_videos = video

                    req.body.article_ad_value = advalue

                    req.body.article_pr_value = prvalue

                    req.body.article_status = 'Done'

                    req.body.article_language = $franc(text)

                }else if(is_using_snippets){

                    const Snippet = module.exports = Function(code)()

                    const _article = new Snippet(_raw_html, $string, $moment, url)

                    const title = await _article.ARTICLE_TITLE()

                    const date = await _article.ARTICLE_PUBLISH()

                    const author = await _article.ARTICLE_AUTHOR()

                    const section = await _article.ARTICLE_SECTION()

                    // const html = await _article.ARTICLE_HTML()

                    const text = await _article.ARTICLE_TEXT()

                    const image = await _article.ARTICLE_IMAGE()

                    const video = await _article.ARTICLE_VIDEO()

                    const values = await media_value_helper(global_rank, local_rank, website_cost, text, image, video)
                    
                    const advalue = values.advalue

                    const prvalue = values.prvalue

                    // const data = {url, title, date, author, section, html, text, image, video, advalue, prvalue}

                    // res.status(200).send(data)


                    req.body.article_url = url

                    req.body.article_title = title

                    req.body.article_authors = author

                    req.body.article_publish_date = date

                    req.body.article_sections = section

                    req.body.article_content = text

                    req.body.article_images = image

                    req.body.article_videos = video

                    req.body.article_ad_value = advalue

                    req.body.article_pr_value = prvalue

                    req.body.article_status = 'Done'

                    req.body.article_language = $franc(text)

                }else{

                    // next('Selectors and Snippets are not configured!')
                    res.status(500).send({

                        error: 'Selectors and Snippets are not configured!',
    
                        error_status: 'Parser Issue!'
    
                    })

                }

                res.status(200).send(req.body)

            }else{
                res.status(500).send({

                    error: 'Website of this article is not in our monitoring',

                    error_status: 'Not Found!'

                })
            }
        } catch (error) {
            next(error)
        }
    })

}