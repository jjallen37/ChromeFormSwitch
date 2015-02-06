/**
 *
 * Created by jjallen on 12/11/14.
 */

/*
    KB_Node constructor
    Param "parent" : A parent KB_Node
    Param "elt" : An html element
 */

var NODE_CLASS = 'kb-content-box-blue';
var SELECTED_CLASS = 'kb-box-shadow-blue';

//var NODE_CLASS = '';
//var SELECTED_CLASS = '';
//var NODE_CLASS = 'switch-navigation-usable';
//var SELECTED_CLASS = 'kb-content-box-green';
var NUM_LIVES = 1;

var KB_Node = function(parent, elt){
    this.parent = parent;
    this.elt = elt;
    this.children = []; // Array of KB_Node
    this.isLeaf = false;
    this.selectedIndex = 0;
    this.lives = 0;
};

KB_Node.prototype.resetLives = function(){
    for (var i=0; i < this.children.length; i++){
        this.children[i].lives = NUM_LIVES;
    }
};

KB_Node.prototype.getSelectedNode = function(){
    if (this.children.length == 0){
        return null;
    }
    return this.children[this.selectedIndex];
};

/*
    Assumes this node is never a leaf
 */
KB_Node.prototype.selectNode = function(){
    // Don't handle leaf selection yet
    var selectedNode = this.children[this.selectedIndex];
    if (selectedNode.isLeaf){
        return selectedNode;
    }

    // Selected node to become new node
    selectedNode.resetLives();
    selectedNode.getSelectedNode().lives--;
    this.decorateNode(false);
    selectedNode.decorateNode(true);
    return selectedNode;
};

KB_Node.prototype.scanNode = function(){
    this.decorateNode(false);
    this.selectedIndex = (this.selectedIndex + 1) % this.children.length;
    var nextNode = this.getSelectedNode();

    // Root node
    if (this.parent == null){
        this.decorateNode(true); // Full cycle, no lives
    } else if (nextNode.lives == 0){ // Reached end of row
        this.parent.resetLives();
        this.parent.getSelectedNode().lives--;
        this.parent.decorateNode(this.parent);
        return this.parent; // Return focus to parent
    } else {
        nextNode.lives--;
        this.decorateNode(true);
    }
    return this;
};

/*
 Node will never be a leaf
 */
KB_Node.prototype.decorateNode = function(toggle){
    if (this.children.length == 0){return;}

    var selectedNode = this.getSelectedNode();
    if (selectedNode.isLeaf){
        if (toggle){
            $(selectedNode.elt).focus();
        } else {
            $(selectedNode.elt).blur();
        }
    }
    $(selectedNode.elt).toggleClass(SELECTED_CLASS, toggle);
    $(this.elt).spotlight();
};
