import time  # allowed
from datetime import date, datetime, timedelta  # allowed

# pseudoconstants to index the loan list
INDEX_TITLE = 0
INDEX_DUE = 1

# pseudoconstant for loan period
FIFTEEN_DAY_LOAN = 15

# Dates derived relative to today so tests are
# date-independent (section 2.4)
today = date.today()
one_day = today - timedelta(days=1)
five_days = today - timedelta(days=5)
seven_days = today - timedelta(days=7)
fourteen_days = today - timedelta(days=14)
fifteen_days = today - timedelta(days=15)
sixteen_days = today - timedelta(days=16)
seventeen_days = today - timedelta(days=17)
eighteen_days = today - timedelta(days=18)
nineteen_days = today - timedelta(days=19)
twenty_days = today - timedelta(days=20)
thirty_days = today - timedelta(days=30)

# loan_list1: All returns within due date
loan_list1 = [
    ("today", today),
    ("one_day", one_day),
    ("seven_days", seven_days),
    ("fourteen_days", fourteen_days),
    ("fifteen_days", fifteen_days)
]
# loan_list2: sixteen and seventeen days past due date
loan_list2 = [
    ("today", today),
    ("one_day", one_day),
    ("seven_days", seven_days),
    ("fourteen_days", fourteen_days),
    ("fifteen_days", fifteen_days),
    ("sixteen_days", sixteen_days),
    ("seventeen_days", seventeen_days)
]

def get_loan_length(loan_date: date) -> int:
    """Return the number of whole days since loan_date."""
    loan_days = (date.today() - loan_date).days
    return loan_days