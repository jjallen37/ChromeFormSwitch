/**
 *
 * Created by jjallen on 12/11/14.
 */

/*
 All tabbable/selectable elements
 */
var LEAF_SELECTORS = [
    'a[href]:visible',
    'input:visible',
    //'input[type=text]',
    //'input[type=checkbox]',
    //'input[type=radio]',
    //'input[type=submit]',
    'input[type!=hidden]',
    'button:visible',
    'textarea:visible',
    'select:visible'
];

var EXIT_EVENT = "spotlight_exit_event";
var settings = {
    HIGHLIGHT_CLASS : 'kb-box-shadow-blue',
    HIGHLIGHT_CLASS2 : 'kb-box-shadow-red',
    NUM_LIVES       : 1
};

var NavTree = function(parent, elt, depth){
    this.parent = parent; // NavTree
    this.elt = elt; // DOM Elt
    this.children = []; // Array of NavTree
    this.isLeaf = false;
    this.activeIndex = 0;
    this.lives = 0;
    this.depth = (this.parent === null) ? 0 : this.parent.depth++;
};

NavTree.prototype.resetLives = function(){
    for (var i=0; i < this.children.length; i++){
        this.children[i].lives = settings.NUM_LIVES;
    }
};

NavTree.prototype.getSelectedNode = function(){
    if (this.children.length == 0){
        return null;
    }
    return this.children[this.activeIndex];
};

/*
    Assumes this node is never a leaf
 */
NavTree.prototype.selectNode = function(){
    // Don't handle leaf selection yet
    var selectedNode = this.children[this.selectedIndex];
    if (selectedNode.isLeaf){
        return selectedNode;
    }

    // Selected node to become new node
    selectedNode.resetLives();
    selectedNode.getSelectedNode().lives--;
    //this.decorateNode(false);
    selectedNode.decorateNode(true);
    return selectedNode;
};

NavTree.prototype.scanNode = function(){
    this.selectedIndex = (this.selectedIndex + 1) % this.children.length;
    var nextNode = this.getSelectedNode();

    // Root node
    if (this.parent == null){
        this.decorateNode(true); // Full cycle, no lives
    } else if (this.selectedIndex == 0){ // Reached end of row
        this.parent.selectedIndex = 0;
        return this.parent; // Return focus to parent
    } else {
        nextNode.lives--;
        this.decorateNode(true);
    }
    return this;
};

NavTree.prototype.setActive = function(index){
    // Remove old active
    var active = this.children[this.activeIndex];
    $(active.elt).trigger(EXIT_EVENT);
    // Update new active
    if (index > 0 && index < this.children.length){
        this.activeIndex = index;
        active = this.children[this.activeIndex];
        $(active.elt).spotlight();

    }
};

/*
 Node will never be a leaf
 */
NavTree.prototype.decorateNode = function(toggle){
    $(this.elt).toggleClass(settings.HIGHLIGHT_CLASS2, toggle);
    if (this.children.length == 0){return;}

    var selectedNode = this.getSelectedNode();
    if (selectedNode.isLeaf){
        if (toggle){
            $(selectedNode.elt).focus();
        } else {
            $(selectedNode.elt).blur();
        }
    }
    $(selectedNode.elt).toggleClass(settings.HIGHLIGHT_CLASS, toggle);
    //$(this.elt).spotlight();
};

/*
    Recursively constructs NavTree for an HTML document from a root NavTree
    Input   : node - A NavTree instance, assumed to be a freshly constructed. It has 0 children.
    Output  : void - Node is built in place
 */
NavTree.buildTree = function(node){
    var $elt = $(node.elt);
    var child;
    // Base case: node is a leaf
    if ($elt.is(LEAF_SELECTORS.join(','))){
        node.isLeaf = true;
        return node;
    }

    // branches contains children of node who have descendants with leaves
    var branches = $elt.children().has(LEAF_SELECTORS.join(','));
    LEAF_SELECTORS.forEach(function(selector,index,array){
        branches = branches.add('> '+selector, $elt); // Add leafs from the current directory
    });

    // If node only has one child with leaf descendants,
    // Node must eat his child
    var dead = false;
    if (branches.length == 1){
        child = new NavTree(node,branches[0]);
        child = NavTree.buildTree(child);
        node.children = child.children; // Steal grandkids
        child = dead; // Kill Child
    } else  if (branches.length > 1){  // If node has multiple leaf-having children
        // Each child will be a node in the final NavTree
        for (var i = 0; i < branches.length; i++){
            child = new NavTree(node, branches[i]);
            child = NavTree.buildTree(child);
            node.children.push(child);
        }
    }
    return node;
};
