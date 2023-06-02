import moment from 'moment'
import authorModel from '../models/AuthorModel.js'
import blogModel from '../models/BlogModel.js'


//  * -------------------------------------------------------------------------------------------------------------------------*
//  *                                              Create Blog Function Start                                                  *
//  * -------------------------------------------------------------------------------------------------------------------------*

export const createBlog = async (req, res) => {
    try {

        let data = req.body
        data.title = data.title.trim()
        data.body = data.body.trim()
        data.authorId = data.authorId.trim()
        data.category = data.category.trim()
        let { title, body, authorId, category, isPublished, isDeleted } = data

        if (!title) return res.status(400).send({ status: false, message: "Please, Provide  title" })
        if (!body) return res.status(400).send({ status: false, message: "Please, Provide  body" })
        if (!authorId) return res.status(400).send({ status: false, message: "Please, Provide  Author ID" })

        if (authorId.length !== 24) return res.status(400).send({ status: false, message: "Please, Provide valid Author ID" })
        const dbAuthorId = await authorModel.findById(authorId)

        if (!dbAuthorId) return res.status(400).send({ status: false, message: "Author ID is not exist" })

        if (!category) return res.status(400).send({ status: false, message: "Please, Provide  Category" })

        if (isPublished) {
            data.publishedAt = moment().format()
        } else {
            delete data.publishedAt
        }

        if (isDeleted) { data.isDeleted = false }

        const saveData = await blogModel.create(data)
        res.status(201).send({ status: true, data: saveData })

    } catch (error) {

        console.log("Error from BlogController.js");
        res.status(500).send({ status: false, message: error.message })

    }
}

//  * -------------------------------------------------------------------------------------------------------------------------*
//  *                                              Create Blog Function End                                                    *
//  * -------------------------------------------------------------------------------------------------------------------------*



//  * -------------------------------------------------------------------------------------------------------------------------*
//  *                                               Get Blog Function Start                                                    *
//  * -------------------------------------------------------------------------------------------------------------------------*

export const getBlog = async (req, res) => {
    try {

        const filter = req.query

        const data = await blogModel.find({ $and: [filter, { isPublished: true, isDeleted: false }] })
        if (data.length === 0) return res.status(404).send({ status: false, message: "Blog not found" })
        res.status(200).send({ status: true, data: data })
    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}
/*
     * -------------------------------------------------------------------------------------------------------------------------*
 *                                                  Get Blog Function End                                                           *
     * -------------------------------------------------------------------------------------------------------------------------*
*/

/*
     * -------------------------------------------------------------------------------------------------------------------------*
 *                                                  Update Blog Function Start                                                      *
     * -------------------------------------------------------------------------------------------------------------------------*
*/

export const updateBlog = async (req, res) => {
    try {
        const blogId = req.params.blogId.trim()
        if (blogId.length !== 24 || blogId == undefined) return res.status(404).send({ status: false, message: "Blog ID is not valid" })
        const data = await blogModel.findOne({ _id: blogId, isDeleted: false })
        if (!data) res.status(404).send({ status: false, message: "Blog is not exist" })

        let { title, body, authorId, tags, category, subcategory, isPublished, publishedAt, isDeleted } = req.body
        let filter = { title, body, tags, category, subcategory, isPublished, publishedAt }

        // if (isDeleted !== undefined) return res.status(404).send({ status: false, message: "You have not permission to delete blog here" })
        if (Object.keys(req.body).length === 0) return res.status(404).send({ status: false, message: "Data not provided for updating the Blog" })
        if (title) { filter.title = title.toString().trim() }
        if (body) { filter.body = body.toString().trim() }
        if (authorId) return res.status(404).send({ status: false, message: "You can't change the author ID" })
        if (tags) { filter.tags = data.tags.concat(tags) }
        if (category) { filter.category = category.toString().trim() }
        if (subcategory) { filter.subcategory = data.subcategory.concat(subcategory) }

        if (data.isPublished) {
            if (!isPublished) {
                filter.isPublished = isPublished
                filter.publishedAt = null  //------------------------------------------------------------
            } else {
                return res.status(404).send({ status: false, message: "Blog is already published" })
            }
        } 
        else {
            if (isPublished) {
                filter.isPublished = isPublished
                filter.publishedAt = moment().format()
            } else {
                return res.status(404).send({ status: false, message: "Blog is already unpublished" })
            }
        }

        const saveData = await blogModel.findOneAndUpdate({ _id: blogId }, filter, { new: true })
        return res.status(200).send({ status: true, data: saveData })

    } catch (error) {
        res.status(500).send({ status: false, message: error.message })
    }
}

/*
     * -------------------------------------------------------------------------------------------------------------------------*
 *                                                  Update Blog Function End                                                        *
     * -------------------------------------------------------------------------------------------------------------------------*
*/




// PUT / blogs /: blogId
// Updates a blog by changing the its title, body, adding tags, adding a subcategory. (Assuming tag and subcategory received in body is need to be added)
// Updates a blog by changing its publish status i.e.adds publishedAt date and set published to true
// Check if the blogId exists(must have isDeleted false).If it doesn't, return an HTTP status 404 with a response body like this
// Return an HTTP status 200 if updated successfully with a body like this
// Also make sure in the response you return the updated blog document.