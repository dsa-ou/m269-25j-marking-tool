// Testing calls
export const testCalls: Record<number, Record<string, string>> = {
  1: {
    'Q2bi' : `try: # allowed
    test(find_client_surname, al_test_table_tma01_q2bi)
except NameError:
    print('Function not defined.')`,
    'Q3a'  : `try: # allowed
    test(find_occurrences_with_follow_on, al_test_table_tma01_q3a)
except NameError:
    print('Function not defined.')`,
    'Q4a'  : `al_tests_tma01_q4a()`,
    'Q5b'  : `try: # allowed
    test(council_decision, al_test_table_tma01_q5b)
except NameError:
    print('Function not defined.')`,
    'Q6a'  : `try: # allowed
    test(weighted_council_decision, al_test_table_tma01_q6a)
except NameError:
    print('Function not defined.')`
  },
  2: {
    'Q2a'  : 'test(power, al_test_table_tma02_q2a)',
    'Q4c' : 'al_test_tma02_q4biii()',
    'Q6a'  : 'al_test_tma02_q6a()'
  },
  3: {
    'Q1a'  : '# Double check in case student removed.\ncheck_tests(q1_your_tests, [Tree, int], max=5)\nprint("\\nChecking student tests against our solution to help grade part (a)...")\ntest(tma03_q1_smallest_product_tutor, q1_your_tests)\nprint("\\nCheck triangles are triangle")\ncheck_triangle_tests(q1_your_tests)',
    'Q1e'  : '# Double check in case student removed.\nprint("\\nChecking your code with the public tests...")\ntest(q1_smallest_product, q1_public_tests)\nprint("\\nChecking student code with the hidden tests...")\ntest(q1_smallest_product, tma03_q1_hidden_tests)',
    'Q4a'  : 'print("\\nChecking our TM against the students tests to help grade part (a)...")\ntest_tm(tutor_tm, q4_your_tests)',
    'Q4d'  : '# Double check in case student removed/didnt add.\nprint("\\nChecking your machine with the public tests...")\ntest_tm(your_tm, q4_public_tests)\nprint("\\nChecking your machine with the hidden tests...")\ntest_tm(your_tm, tma03_q4_hidden_tests)'
  }
};
