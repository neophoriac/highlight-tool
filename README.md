# highlight-tool

Let's users create a list of words with which enables them to seek words on the document and highlights them.

Uses treeWalker to traverse the document's body to match the words each text node at a time.

Uses Regular Expressions to match the words.

Utilizes mutation observer to locate new nodes and feeds those nodes to the highlight function.

Can change color and background color of each individual word on the list.

Can be case sensitive or case insensitive.


   **to do:**

- lock to one color on a list
- simple mode where is just text with words seperated with a line break
- issues with SPAs
- Show list highlighting info
- Indicate highlighted count on icon
- remove highlight on active tab when deleting
- transfer word selection to other list or new list
- renaming doesn't change name on list, just listorder
- context menu - add to new lists
- if list is delete, it remains in accepted lists in content.js

errors:

Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received

Failed to execute 'createTreeWalker' on 'Document': parameter 1 is not of type 'Node'.
