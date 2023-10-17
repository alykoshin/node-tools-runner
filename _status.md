<!-- @format -->

# 2023-10-16

1. Переписал state, инициализацию runner, добавил tracker, не отладил [src\apps\runner\runner.ts](src\apps\runner\runner.ts).
2. Последние отлаживаемые команды:

```shell
 ts-node .\src\cli.ts .\src\tests\lisp-like\iteration-and-mapping.ts
```

Падает в искл.ситуацию при применении `mapc` к элементу за концом списка.

Тесты с 2 списками зацикливаются.
