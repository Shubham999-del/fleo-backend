const mongoose = require('mongoose')

const categorySchema = new mongoose.Schema({
	name : {
		type : String,
		required : true,
		trim : true,
	},
	level : {
		type : Number,
		default : 0
	},
	target_sales : {
		type : Number
	},
	current_sales : {
		type : Number
	},
	parent : {
		type : mongoose.Schema.Types.ObjectId,
		ref : 'Category'
	},
	created_at : {
		type : Date,
		default : Date.now
	},
})

const Category = mongoose.model('Category', categorySchema)

module.exports.Category = Category