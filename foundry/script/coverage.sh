forge coverage --report lcov --ffi

lcov --remove lcov.info -o lcov.info 'script/*' 'src/mock/*'

genhtml lcov.info -o ./coverage

rm lcov.info