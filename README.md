# highlight-tool

Let's users create a list of words with which enables them to seek words on the document and highlights them.

Uses treeWalker to traverse the document's body to match the words each text node at a time.

Uses Regular Expressions to match the words.

Utilizes mutation observer to locate new nodes and feeds those nodes to the highlight function.

Can change color and background color of each individual word on the list.

Can be case sensitive or case insensitive.
