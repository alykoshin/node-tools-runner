;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; 
; https://lisp-lang.org/learn/first-steps
; 

; 
; Syntax
; Lisp syntax is very simple: there are few rules to remember.
; 
; Syntax is made up of S-expressions. An S-expression is either an atom or a list.
; 
; Atoms can be numbers like 10, 3.14, or symbols like t (the truth constant), +, my-variable. There’s also a special kind of symbol called keywords, which are colon-prefixed symbols like :thing or :keyword. Keywords evaluate to themselves: you can think of them sort of like enums.

; 
; Hello, World!
; 
; Without further ado:

CL-USER> (format t "Hello, world!")
; Hello, world!
; NIL

; 
; Comments
; 

; Single line comments start with a semicolon, and can start at any point in the line

#|
  This is a multi-line comment.

  #|
    They can be nested!
  |#
|#

;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; 
; https://lisp-lang.org/learn/functions
; 
; Named Functions
; 
; You define functions using the defun macro:

(defun fib (n)
  "Return the nth Fibonacci number."
  (if (< n 2)
      n
      (+ (fib (- n 1))
          (fib (- n 2)))))

; And call them like you call anything else:

CL-USER> (fib 30)
; 832040

; 
; Anonymous Functions
; 
; Application
; 
; Functions can be called indirectly using funcall:

CL-USER> (funcall #'fib 30)
; 832040

; Or with apply:

CL-USER> (apply #'fib (list 30))
; 832040

; 
; Multiple Return Values
; 

(defun many (n)
  (values n (* n 2) (* n 3)))

CL-USER> (multiple-value-list (many 2))
; (2 4 6)

CL-USER> (nth-value 1 (many 2))
; 4

; We can also use multiple-value-bind to assign each return value to a variable:

CL-USER> (multiple-value-bind (first second third)
              (many 2)
            (list first second third))
; (2 4 6)


;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
; 
; https://lisp-lang.org/learn/variables
; 
; Local Variables
; 
; Local variables behave like in any other language: they are normal lexically scoped variables.

; Variables are declared with the let special operator:

(let ((str "Hello, world!"))
  (string-upcase str))
; => "HELLO, WORLD!"

; You can define multiple variables:

(let ((x 1)
      (y 5))
  (+ x y))
; => 6

; To define variables whose initial values depend on previous variables in the same form, use let*:

(let* ((x 1)
        (y (+ x 1)))
  y)
; => 2

; 
; Dynamic Variables
; 
; Dynamic variables are sort of like global variables, but more useful: they are dynamically scoped. You define them either with defvar or defparameter, the differences being:
; 
; defparameter requires an initial value, defvar does not.
; defparameter variables are changed when code is reloaded with a new initial value, defvar variables are not.
; What does dynamic scoping mean? It means:

(defparameter *string* "I'm global")

(defun print-variable ()
  (print *string*))

(print-variable) ;; Prints "I'm global"

(let ((*string* "I have dynamic extent")) ;; Binds *string* to a new value
  (print-variable)) ;; Prints "I have dynamic extent"

; The old value is restored

(print-variable) ;; Prints "I'm global"

; In other words, when you redefine the value of a dynamic variable using let, the variable is bound to the new value inside the body of the let, and the old value is ‘restored’ afterwards.
