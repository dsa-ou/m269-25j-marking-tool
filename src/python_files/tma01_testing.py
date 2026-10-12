# Note: this approach DELIBERATELY works in a way
# that will fail the question.

def test_browser_history(expected: tuple) -> bool:
    """Test create_revisit_list with given sites."""
    history = BrowserHistory()
    for site in expected[0]:
        history.visit_page(site)
    if history.history.items != expected[0]:
        return False
    if history.revisit_list != []:
        return False
    history.create_revisit_list()
    if history.history.items != []:
        return False
    if history.revisit_list != expected[1]:
        return False
    return True
    