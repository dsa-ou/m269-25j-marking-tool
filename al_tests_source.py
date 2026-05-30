# m269_tree
class Tree:
    """A rooted binary tree."""

    def __init__(self) -> None:
        """Create an empty tree."""
        self.root = None
        self.left = None
        self.right = None

def is_empty(tree: Tree) -> bool:
    """Return True if and only if tree is empty."""
    return tree.root == tree.left == tree.right == None

def join(item: object, left: Tree, right: Tree) -> Tree:
    """Return a tree with the given root and subtrees."""
    tree = Tree()
    tree.root = item
    tree.left = left
    tree.right = right
    return tree

def leaf(item: object) -> Tree:
    """Return a node with the item and empty subtrees."""
    return join(item, Tree(), Tree())

# The leaves for all the example trees.
THREE = leaf(3)
FOUR = leaf(4)
FIVE = leaf(5)
SIX = leaf(6)

TPM = join('*', join('+', THREE, FOUR), join('-', FIVE, SIX)) # (3+4)*(5-6)
PMT = join('+', THREE, join('-', join('*', FOUR, FIVE), SIX)) # 3+((4*5)-6)
MPT = join('-', join('+', THREE, join('*', FOUR, FIVE)), SIX) # (3+(4*5))-6

def is_leaf(tree: Tree) -> bool:
    """Return True if and only if the tree is a single leaf."""
    return not is_empty(tree) and is_empty(tree.left) and is_empty(tree.right)

def size(tree: Tree) -> int:
    """Return the number of nodes in tree."""
    if is_empty(tree):
        return 0
    else:
        return size(tree.left) + size(tree.right) + 1

def write(tree: Tree, level: int) -> None:
    """Print the tree as in file browsers, with subtrees indented.

    Preconditions: level >= 0 is the initial indentation level
    """
    if is_empty(tree):
        print(' ' * 4 * level, 'EMPTY')
    else:
        print(' ' * 4 * level, tree.root)
        write(tree.left, level + 1)
        write(tree.right, level + 1)



# TMA01
al_test_table_tma01_q2bi = [ # find_client_surname
    ['found at start', "SMITH AGREEMENT", "SMI", True],
    ['not found', "THE CLIENT IS JONES", "RAU", False],
    ['partial match only', "SMILE AND DISMISSED", "SMI", True],
    ['exact match only', "SMITHSMITH", "SMI", True],
    ['short surname found', "AL AGREEMENT WITH ALI", "ALI", True],
    ['short surname not found', "AGREEMENT WITH SMITH", "ALI", False],
]

al_test_table_tma01_q3a = [
    ['single match', "THE CLIENT IS SMITH", "SMI", ["SMITH"]],
    ['no match', "THE CLIENT IS JONES", "SMI", []],
    ['match at start', "SMITH IS THE CLIENT", "SMI", ['SMITH IS THE ']],
    ['match at end', "THE CLIENT IS MR SMI", "SMI", ["SMI"]],
    ['multiple matches', "SMITH ALWAYS SMILES", "SMI", ['SMITH ALWAYS ', 'SMILES']],
    ['short follow-on', "HELLO SMI", "SMI", ["SMI"]],
    ['exactly 10 after', "SMI1234567890", "SMI", ['SMI1234567890']],
    ['less than 10 after', "SMI123", "SMI", ["SMI123"]],
    ['adjoining matches', "SMISMISMI", "SMI", ['SMISMISMI', 'SMISMI', 'SMI'] ],
    ['match with punctuation', "HELLO, SMI!", "SMI", ["SMI!"]],
    ['match with numbers', "123SMI4567890", "SMI", ["SMI4567890"]],
    ['overlapping matches', "ABCCLCLCABC", "CLC", ["CLCLCABC","CLCABC"]],
]

def al_tests_tma01_q4a():
    print('\nTutor Tests')
    music_1 = MusicHistory()
    music_1.add_song('Escape (The Pina-Colada Song)')
    music_1.add_song('Pretty Fly (For a White Guy)')
    music_1.add_song('Bad Touch')
    test1 = music_1.playlist.size()==0
    print('Test 1: Playlist not filled yet.',test1)
    music_1.previous_song()
    music_1.create_playlist()
    expected = ['Pretty Fly (For a White Guy)','Escape (The Pina-Colada Song)']
    test2 = music_1.playlist.items == expected
    print('Test 2: Works after one removed.',test2)
    music_1.add_song('Kickapoo')
    music_1.add_song('Danger! High Voltage')
    expected = ['Kickapoo','Danger! High Voltage']
    test3 = music_1.history.items == expected
    print('Test 3: Adding new songs.',test3)
    music_1.create_playlist()
    test4 = music_1.history.size()==0
    print('Test 4: History re-emptied.',test4)
    expected = ['Danger! High Voltage','Kickapoo']
    test5 = music_1.playlist.items == expected
    print('Test 5: Playlist emptied then refilled.',test5)
    if not (test1 and test2 and test3 and test4 and test5):
        print('\n--- NOT ALL TESTS PASSED --')

al_test_table_tma01_q5b = [
    [
        'more yes than no, no neutral',
        [
            "Yes", "Yes", "Yes", "Yes", "Yes", "Yes", "Yes",
            "No", "No","No",
        ],
        "approve"
    ],
    [
        'more yes than no, with neutral',
        [
            "Yes", "Yes", "Yes", "Yes", "Yes",
            "No", "No","No", "No",
            "Neutral",
        ],
        "approve"
    ],
    [
        'more no than yes, no neutral',
        [
            "Yes", "Yes", "Yes",
            "No", "No","No", "No", "No", "No", "No",
        ],
        "reject"
    ],
    [
        'equal yes and no',
        [
            "Yes", "Yes", "Yes", "Yes",
            "No", "No", "No", "No",
            "Neutral", "Neutral"
        ],
        "tie"
    ],
    [
        'all neutral',
        ["Neutral"] * 10,
        "tie"
    ],
    [
        'no neutral, tie',
        ["Yes"] * 5 + ["No"] * 5,
        "tie"
    ],
    [
        'all yes',
        ["Yes"] * 10,
        "approve"
    ],
    [
        'all no',
        ["No"] * 10,
        "reject"
    ],
]

al_test_table_tma01_q6a = [
    [
        'more no than yes',
        [
            ("Senior", "No"),  ("Junior", "No"),  ("Senior", "No"),
            ("Junior", "No"),  ("Senior", "No"),  ("Junior", "Yes"),
            ("Senior", "Yes"), ("Junior", "Yes"), ("Senior", "No"),
            ("Junior", "Yes")
        ],
        "reject"
    ],

    [
        'Senior based win',
        [
            ("Senior", "Yes"), ("Senior", "Yes"), ("Senior", "Yes"),
            ("Senior", "Yes"), ("Senior", "Yes"), ("Junior", "No"),
            ("Junior", "No"), ("Junior", "No"), ("Junior", "No"),
            ("Junior", "No")
        ],
        "approve"
    ],
    [
        'Juniors overruled',
        [
            ("Senior", "No"),  ("Senior", "No"),  ("Senior", "No"),
            ("Senior", "No"),  ("Senior", "No"),  ("Junior", "Yes"),
            ("Junior", "Yes"), ("Junior", "Yes"), ("Junior", "Yes"),
            ("Junior", "Yes"),
        ],
        "reject"
    ],
    [
        'Close win',
        [
            ("Senior", "Yes"), ("Senior", "No"), ("Senior", "Yes"),
            ("Senior", "No"),  ("Senior", "No"), ("Junior", "Yes"),
            ("Junior", "Yes"), ("Junior", "Yes"), ("Junior", "Yes"),
            ("Junior", "No"),
        ],
        "approve"
    ],
    [
        'Close lose',
        [
            ("Senior", "Yes"), ("Senior", "No"), ("Senior", "Yes"),
            ("Senior", "No"),  ("Senior", "No"), ("Junior", "Yes"),
            ("Junior", "Yes"), ("Junior", "Yes"), ("Junior", "No"),
            ("Junior", "No"),
        ],
        "reject"
    ],

]
# TMA02
al_test_table_tma02_q2a = [ # power
    ['normal',  5, 5, 3125],
    ['0 power', 2, 0, 1],
    ['0 base',  0, 2, 0],
    ['both 0',  0, 0, 1]
]

def al_test_tma02_q4biii():
    print('Performing Tutor Tests')
    alA = TreeNode('A')
    alB = TreeNode('B')
    alC = TreeNode('C')
    alD = TreeNode('D')
    alE = TreeNode('E')
    alF = TreeNode('F')
    alG = TreeNode('G')
    alH = TreeNode('H')
    alJ = TreeNode('J')
    alA.left = alB
    alA.right = alC
    alB.left = alD
    alB.right = alE
    alC.left = alF
    alC.right = alG
    alD.right = alH
    alE.left = alJ
    
    test_table_tma02_q4biii = [
        ['B, C -> A',  alA, alB, alC, alA],
        ['D, E -> B',  alA, alD, alE, alB],
        ['B, F -> A',  alA, alB, alF, alA],
        ['F, B -> A',  alA, alF, alB, alA],
        ['F, G -> C',  alA, alF, alG, alC],
        ['H, J -> B',  alA, alH, alJ, alB],
        ['H, F -> A',  alA, alH, alF, alA],
        ['D, H -> D',  alA, alD, alH, alD],
    ]
    test(nearest_common_ancestor, test_table_tma02_q4biii)

def al_test_tma02_q6a():
    print('Performing Tutor Tests')
    al_treasure_map = [
        Trove("Black Powder Bay", 61, 1832, 7),
        Trove("Rum Runner's Cove", 77, 1851, 10),
        Trove("Dead Man's Lagoon", 23, 2560, 2),
        Trove("Cutlass Reef",96, 607, 8),
        Trove("the Siren's Snare", 46, 793, 5),
        Trove("Gold Tooth Isle", 89, 2577, 2)
    ]
    
    al_expected1 = Plan([],0)
    al_expected2 = Plan(["Dead Man's Lagoon","Black Powder Bay"],3607)
    al_expected3 = Plan(["Dead Man's Lagoon","Black Powder Bay"],3869)
    al_expected4 = Plan(["Dead Man's Lagoon","Black Powder Bay","Rum Runner's Cove"],4762)
    al_expected5 = Plan(["Dead Man's Lagoon","Black Powder Bay","Gold Tooth Isle",
                      "Rum Runner's Cove","the Siren's Snare", "Cutlass Reef"],10220)
    
    test_table_tma02_q6a = [
        ['Weight: 5',  al_treasure_map, 5, al_expected1],
        ['Weight: 61',  al_treasure_map, 61, al_expected2],
        ['Weight: 68',  al_treasure_map, 68, al_expected3],
        ['Weight: 103',  al_treasure_map, 103, al_expected4],
        ['Weight: 400',  al_treasure_map, 400, al_expected5],
    ]
    test(greedy_trove_selection, test_table_tma02_q6a)
    
# TMA03
ONE = leaf(1)
ZERO = leaf(0)
ROOT7 = join(7, FOUR, ONE)
ROOT2 = join(2, ONE, FIVE)  
A_ZERO = join(12, ROOT7, join(2, ONE, ZERO))        # one zero, rest positive
ZERO3 = join(0, ZERO, ZERO)
ZERO6 = join(0, ZERO3, ZERO3)                       # 3 rows of zeros
ROOT12 = join(12, ROOT7, ROOT2) # the right child of ROOT7 is the left child of ROOT2
ROOT3 = join(3, FIVE, FOUR)     # another example: 3 // 5 4
TWO_SMALLEST = join(12, ROOT7, join(7, ONE, FIVE))  # two paths 12->7->1
# This 3-row triangle is in the Q1(b) answer:
TWO = leaf(2)
THREE = leaf(3)
ROOT6 = join(6, join(4, THREE, TWO), join(5, TWO, ONE))
# The following lines build a 4-row triangle where choosing the smallest child is wrong:
#    17
#   8 9
#  7 2 1
# 4 1 5 1
ROOT1 = join(1, FIVE, ONE)
ROOT8 = join(8, ROOT7, ROOT2)
ROOT9 = join(9, ROOT2, ROOT1)
ROOT17 = join(17, ROOT8, ROOT9)
# These are in the answer to Q2(b):
TREE21 = join(2, ONE, ONE)
BACK_THREE = join(3, TREE21, TREE21)
TREE23 = join(2, THREE, THREE)
BACK_ONE = join(1, TREE23, TREE23)

tma03_q1_hidden_tests = [
    # case,                 triangle,           product
    ("smallest input",      SIX,                6),     # edge case
    ("smallest output > 0", join(1, ONE, SIX),  1*1),   # edge case
    ("all same, 2 rows",    join(5, FIVE, FIVE),5*5),
    ("positive & zero",     A_ZERO,             0),     # edge case
    ("all zero",            ZERO6,              0),     # edge case
    ("two smallest paths",  TWO_SMALLEST,       12*7*1),
    ("backtracking helps",  BACK_THREE,         3*2*1),
    ("backtrack = exhaustive", BACK_ONE,        1*2*3),
    ("3-row greedy fails",  ROOT6,              6*5*1), # greedy: 6*4*2
    ("4-row greedy fails",  ROOT17,             17*9*1*1), # greedy: 17*8*2*1
]

def tma03_q1_smallest_product_tutor(triangle: Tree) -> int:
    """Return the smallest product of integers from the root to a leaf.

    Preconditions: the triangle isn't empty; the nodes are non-negative integers.
    """
    if is_leaf(triangle):
        return triangle.root
    else:
        left_product = tma03_q1_smallest_product_tutor(triangle.left)
        right_product = tma03_q1_smallest_product_tutor(triangle.right)
        return min(left_product, right_product) * triangle.root
        
def al_smallest_product_1(triangle: Tree) -> int:
    """Return the best solution the problem instance and its value."""
    candidate = []
    extensions = {triangle}
    best = [[], math.inf]
    al_extend_1(candidate, extensions, best)
    return best[VALUE]

def al_value(candidate: list) -> int:
    """Return the value of the candidate sequence."""
    product = 1
    for number in candidate:
        product *= number
    # print(f"value({candidate})={product}")
    return product
    
def al_extend_1(candidate: list, extensions: set, best: list) -> None:
    """Update best if candidate is a better solution, then extend it."""
    # print('Visiting node', candidate, extensions)
    # A candidate is a solution if there are no more extensions.
    if len(extensions) == 0:
        candidate_value = al_value(candidate)
        if candidate_value < best[VALUE]:
            # print('New best with value', candidate_value)
            best[SOLUTION] = candidate
            best[VALUE] = candidate_value
    for tree in extensions:
        if can_extend(tree, candidate, best):
            # If this extension is a leaf, there are no next extensions.
            if is_leaf(tree):
                subtrees = set()
            else:
                subtrees = {tree.left, tree.right}
            al_extend_1(candidate + [tree.root], subtrees, best)
            
def al_test_tma03_q2d():
    AL_ONE = leaf(1) # TODO: put this new function in 25J book
    AL_THREE = leaf(3)
    AL_FOUR = leaf(4)
    AL_FIVE = leaf(5)
    AL_SIX = leaf(6)
    AL_TWO_ONE = join(2, AL_ONE, AL_ONE)
    AL_TWO_THREE = join(2, AL_THREE, AL_THREE)
    AL_ROOT7 = join(7, AL_FOUR, AL_ONE)  # FOUR and FIVE are defined in m269_tree
    AL_ROOT1 = join(1, AL_FIVE, AL_ONE)
    AL_ROOT2 = join(2, AL_ONE, AL_FIVE)  # note the common ONE node with ROOT7
    AL_ROOT8 = join(8, AL_ROOT7, AL_ROOT2)
    AL_ROOT9 = join(9, AL_ROOT2, AL_ROOT1)
    AL_TWO_SMALLEST = join(12, AL_ROOT7, join(7, AL_ONE, AL_FIVE))
    al_tma03_q2_hidden_tests = [
        # case,                 triangle,                   product
        ("smallest input",      AL_SIX,                        6),
        ("smallest output > 0", join(1, AL_ONE, AL_SIX),          1*1),
        ("all same, 2 rows",    join(5, AL_FIVE, AL_FIVE),        5*5),
        ("two smallest paths",  AL_TWO_SMALLEST,               12*7*1),
        ("4 rows",              join(17, AL_ROOT8, AL_ROOT9),     17*9*1*1),
        ("some pruning",        join(3, AL_TWO_ONE, AL_TWO_ONE),  3*2*1),
        ("no pruning",          join(1, AL_TWO_THREE, AL_TWO_THREE), 1*2*3),
    ]
    # Run our solution on the student's tests. Give feedback to student if they fail.
    print("\nChecking the student's tests with our solution...")
    test(al_smallest_product_1, q2_your_tests)
    print("\nSee in part d) if the student's solution passed the public tests.")
    print("\nChecking the student's solution with our hidden tests...")
    test(globals()[input('Enter function name: ')], al_tma03_q2_hidden_tests)

RIGHT = 1
LEFT = -1
STAY = 0


tma03_q4_hidden_tests = [
    # case,             input,          debug,  output
    # length < 2
    ("one letter",      ["a"],          False, [False]),
    ("one single",      ["'"],          False, [False]),
    ("one double",      ['"'],          False, [False]),
    # doesn't start with a quote
    ("only letters",    list("aaa"),    False, [False]),
    ("quotes after a",  list("a'\"a"),  False, [False]),
    # doesn't end with the same quote
    ("single-double",   list("'a\""),   False, [False]),
    ("double-single",   list("\"a'"),   False, [False]),
    ("single-none",     list("'a"),     False, [False]),
    ("double-none",     list('"a'),     False, [False]),
    # quote within string
    ("double in double",list('"aa"a"'), False, [False]),
    ("single in single",list("'aa'a'"), False, [False]),
    ("double in single",list("'aa\"a'"),False, [True]),
    ("single in double",list('"aa\'a"'),False, [True]),
    # no quotes within quotes
    ("letter in single",list("'aa'"),   False, [True]),
    ("none in single",  list("''"),     False, [True]),
    ("letter in double",list('"aa"'),   False, [True]),
    ("none in double",  list('""'),     False, [True]),
]

tutor_tm = {
    ("start", "a"):     ("a", RIGHT, "false"),
    ("start", "'"):     ("'", RIGHT, "single"),
    ("start", '"'):     ('"', RIGHT, "double"),

    ("false", "a"):     ("a", RIGHT, "false"),
    ("false", "'"):     ("'", RIGHT, "false"),
    ("false", '"'):     ('"', RIGHT, "false"),
    ("false", None):     (False, STAY, "false"),

    ("single", "a"):    ("a", RIGHT, "single"),
    ("single", '"'):    ('"', RIGHT, "single"),
    ("single", "'"):    ("'", RIGHT, "true"),
    ("single", None):   (None, STAY, "false"),

    ("double", "a"):    ("a", RIGHT, "double"),
    ("double", "'"):    ("'", RIGHT, "double"),
    ("double", '"'):    ('"', RIGHT, "true"),
    ("double", None):   (None, STAY, "false"),

    ("true", "a"):      ("a", STAY, "false"),
    ("true", "'"):      ("'", STAY, "false"),
    ("true", '"'):      ('"', STAY, "false"),
    ("true", None):     (True, STAY, "true"),
}

"""
Utilities to check if a triangle really is a 'triangle' - ie right and left trees
are shared items, if it is do a pretty print
"""

def height_triangle(triangle: Tree) -> int:
    """Return the height of the triangle."""
    if is_empty(triangle):
        return 0
    else:
        return max(height_triangle(triangle.left), height_triangle(triangle.right)) + 1

def leading_spaces(height: int, level: int) -> str:
    """Return the height of the triangle."""
    return " "*(2*(height - level))
    
def check_triangle(name: str, triangle: Tree):
    """Check and print a 'named' triangle"""
    print(name)
    height = height_triangle(triangle) # defines width also
    level = 0
    spaces = leading_spaces(height, level) + " "
    
    # do a basic breadth first search of the tree
    this_level = []
    next_level = []
    this_level.append(triangle) # initiate with root
    
    while len(this_level) > 0:
        tree = this_level.pop(0)
        print(spaces, "%02d"%tree.root, end="")
        spaces = "  "

        if not is_empty(tree.left):
            if is_empty(tree.right): # can't have right tree with no left
                print("\nbad triangle node has only one child",  tree.root)
                return

            if len(next_level) == 0: # only add leftmost node from left subchild
                next_level.append(tree.left)
            else: # if not leftmost node, then this must be same node as right subchild of previous node
                if tree.left != next_level[-1]: # NOTE we match objects not values!
                    print("\nbad triangle mismatch on shared nodes",  tree.left.root, next_level[-1].root)
                    return

        if not is_empty(tree.right):
            if is_empty(tree.left): # can't have left tree with no right
                print("\nbad triangle node has only one child",  tree.root)
                return
            next_level.append(tree.right) # add right tree (same as left tree on previous node)

        # if it was last tree of this level, start new line and level
        if len(this_level) == 0:
            print()
            this_level = next_level
            next_level = []
            level += 1
            spaces = leading_spaces(height, level)
    # newline to finish
    print()
            
def check_triangle_tests(tests: list):
    """
    Take in a set of M269 tests and pass each to check_triangle
    assume that the first item in a test is its name and the second the triangle to check
    """
    for test in tests:
        check_triangle(test[0], test[1])

print('All tests loaded.')