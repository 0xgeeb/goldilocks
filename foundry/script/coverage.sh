forge coverage --report lcov --ffi

lcov --remove lcov.info -o lcov.info 'script/*' 'src/mock/*' 'test/invariant/*' --rc lcov_branch_coverage=1

genhtml lcov.info -o ./coverage --branch-coverage

rm lcov.info