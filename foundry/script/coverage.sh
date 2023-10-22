forge coverage --report lcov --ffi

lcov --remove lcov.info -o lcov.info 'script/*' 'src/mock/*' 'test/invariant/*'

genhtml lcov.info -o ./coverage

rm lcov.info