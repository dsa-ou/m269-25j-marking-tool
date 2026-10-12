
class Stack:
    """A last-in, first-out sequence of objects, implemented with a Python list."""

    def __init__(self) -> None:
        """Initialise the stack to be empty."""
        self.items = []

    def size(self) -> int:
        """Return the number of items in the stack."""
        return len(self.items)

    def peek(self) -> object:
        """Return the top item in the stack.

        Preconditions: self.size() > 0
        """
        return self.items[-1]

    def pop(self) -> object:
        """Remove and return the top item from the stack.

        Preconditions: self.size() > 0
        """
        return self.items.pop(-1)

    def push(self, item: object) -> None:
        """Put the given item on top of the stack.

        Postconditions: post-self.peek() == item
        """
        self.items.append(item)

class LinkedListStack:
    """A last-in, first-out sequence of objects, implemented with a linked list."""

    class Node:
        """A node in a linked list."""

        def __init__(self, item: object) -> None:
            """Initialise the node with the given item."""
            self.item = item
            self.next = None

    def __init__(self) -> None:
        """Initialise the stack to be empty."""
        self.head = None
        self.length = 0

    def size(self) -> int:
        """Return the number of items in the stack."""
        return self.length

    def peek(self) -> object:
        """Return the top item in the stack.

        Preconditions: self.size() > 0
        """
        return self.head.item

    def pop(self) -> object:
        """Remove and return the top item from the stack.

        Preconditions: self.length() > 0
        """
        item = self.head.item
        self.head = self.head.next
        self.length = self.length - 1
        return item

    def push(self, item: object) -> None:
        """Put the given item on top of the stack.

        Postconditions: post-self.peek() == item
        """
        node = LinkedListStack.Node(item)
        node.next = self.head
        self.head = node
        self.length = self.length + 1
