const {Category} = require('../models/category')

function treeify(list, idAttr, parentAttr, childrenAttr) {
    if (!idAttr) idAttr = 'id';
    if (!parentAttr) parentAttr = 'parent';
    if (!childrenAttr) childrenAttr = 'children';
    var treeList = [];
    var lookup = {};
    list.forEach(function(obj) {
        lookup[obj[idAttr]] = obj;
        obj[childrenAttr] = [];
    });
    list.forEach(function(obj) {
        if (obj[parentAttr] != null) {
            lookup[obj[parentAttr]][childrenAttr].push(obj);
        } else {
            treeList.push(obj);
        }
    });
    return treeList;
}

// This function deletes the object id recursively onthe SAME OBJECT
function objectIdDel(copiedObjectWithId) {
  if (copiedObjectWithId != null && typeof(copiedObjectWithId) != 'string' &&
    typeof(copiedObjectWithId) != 'number' && typeof(copiedObjectWithId) != 'boolean' ) {
    //for array length is defined however for objects length is undefined
    if (typeof(copiedObjectWithId.length) == 'undefined') { 
      delete copiedObjectWithId._id;
      for (var key in copiedObjectWithId) {
        objectIdDel(copiedObjectWithId[key]); //recursive del calls on object elements
      }
    }
    else {
      for (var i = 0; i < copiedObjectWithId.length; i++) {
        objectIdDel(copiedObjectWithId[i]);  //recursive del calls on array elements
      }
    }
  }
} 

const loadCategoryDetails = async(id) => {
	const category = await Category.findById(id).populate('parent').lean()
	category['progress_perc'] = (category.current_sales/category.target_sales)*100
	return category
}

function loadTreeOfID(id, categories){
	if(categories.length) return
	for(let category of categories){
		if(category._id == id){
			return category
		}else{
			if(category.children.length){
				loadTreeOfID(id, category.children)
			}
		}
		
	}
}

function collectNodes(rootNode) {
    const nodes = []

    function visitNode(node) {
        nodes.push(node)

        if (node.children) {
            node.children.forEach(visitNode)
        }
    }

    visitNode(rootNode)

    return nodes
}
module.exports = { treeify, objectIdDel, loadCategoryDetails, loadTreeOfID, collectNodes }