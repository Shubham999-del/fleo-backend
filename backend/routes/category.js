const mongoose = require('mongoose')
const express = require('express')
const router = express.Router()
const {Category} = require('../models/category')
const {treeify, loadCategoryDetails, collectNodes} = require('../functions/default')

//Get all categories
router.get('/', async(req, res) => {

	let categories = []
	// let search_obj = {}

	if(req.query.id){
		const parent_id = req.query.id
		const parent_cat = await Category.findById(parent_id).lean()
		parent_cat['parent'] = null
		categories.push(parent_cat)

		// Now find the all categories greater than parent level
		const child_categories =  await Category.find({ level : { $gt : parent_cat.level}}).lean()
		categories = [...categories, ...child_categories]
	}else{
		categories = await Category.find().lean()
	}

	categories = treeify(categories, '_id')
	return res.send(categories)
})

//Get category by ID
router.get('/:id', async(req, res) => {
	const category_id = req.params.id

	const category = await Category.findOne({
		_id : category_id
	}).lean()

	if(!category){
		return res.status(404).send('No category found')
	}

	const category_new = await loadCategoryDetails(category._id)

	return res.send(category_new)
})

//Create a new category
router.post('/', async(req, res) => {
	const value = req.body

	//Checking for duplicacy
	const dup = await Category.findOne({
		name : value.name,
	}).lean()

	if(dup) return res.status(400).send('Category with this name already exists')

	let level = 0
	if(value.parent){
		const parent_details = await Category.findById(value.parent).lean()
		level = parent_details.level + 1
	}

	const category = new Category({
		name : value.name,
		current_sales : value.current_sales,
		target_sales : value.target_sales,
		parent : value.parent,
		level
	})

	await category.save()

	return res.send(category)
})

//Updating a category
router.put('/:id', async(req, res) => {
	const value = req.body

	const category_id = req.params.id
	let category = await Category.findById(category_id)

	if(!category){
		return res.status(400).send('Invalid category')
	}

	// If parent and this category is same
	if(category._id == value.parent){
		return res.status(400).send('Parent and category cannot be same')
	}

	let level = 0
	if(value.parent){
		const parent_details = await Category.findById(value.parent).lean()
		level = parent_details.level + 1
	}

	category.set({
		name : value.name,
		current_sales : value.current_sales,
		target_sales : value.target_sales,
		parent : value.parent,
		level
	})

	await category.save()

	const new_category = await loadCategoryDetails(category._id)
	
	return res.send(category)
})

//Delete a category by admin
router.delete('/:id', async(req, res) => {
	const category_id = req.params.id
	const children = !!req.query.children
	const category = await Category.findById(category_id).populate('parent').lean()

	if(!category){
		return res.status(400).send('Invalid category')
	}

	// Checking if the category is used as a parent of any category
	const parent_cat_chk = await Category.findOne({
		parent : category_id
	})

	if(parent_cat_chk){
		if(!children){
			// Dont delete children, here make childs orphan
			// Find children
			const children = await Category.find({ parent : category_id }).lean()
			for(let child of children){
				const upd_obj = await Category.findById(child._id)
				upd_obj.set({
					parent : null,
					level : 0
				})

				await upd_obj.save()
			}
		}else{
			// Delete the chldren
			let categories = []
			console.log("DELTE CHILDREN")
			const children = await Category.find({ parent : category_id }).lean()
			if(children.length){
				const parent_id = category_id
				const parent_cat = await Category.findById(parent_id).lean()
				parent_cat['parent'] = null
				categories.push(parent_cat)

				// Now find the all categories greater than parent level
				const child_categories =  await Category.find({ level : { $gt : parent_cat.level}}).lean()
				categories = [...categories, ...child_categories]
				categories = treeify(categories, '_id')
				const all_children_flat = collectNodes(categories[0])
				for(let child_flat of all_children_flat){
					const upd_row = await Category.deleteOne({ _id : child_flat._id })
				}
			}
		}
	}

	const deleted_obj = await Category.deleteOne({
		_id : category_id
	})
	// const deleted_obj = {}
	return res.send(deleted_obj)
})

module.exports = router