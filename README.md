# Gaussian-elimination
Solution Ax=b using Gaussian elimination then backwards substitution. 

A is an n by n matrix. 
x and b are n by 1 vectors. 

Uses partial pivoting and scaling in order to improve accuracy


####Row Redutcion
A linear algebra algorithm for solving systems of linear equations. It is usually understood as a sequence of operations performed on the associated matrix of coefficients. This method can also be used to find the rank of a matrix, to calculate the determinant of a matrix, and to calculate the inverse of an invertible square matrix. 

To perform row reduction on a matrix, one uses a sequence of elementary row operations to modify the matrix until the lower left-hand corner of the matrix is filled with zeros, as much as possible. There are three types of elementary row operations: 

1. Swapping two rows
2. Multiplying a row by a non-zero number
3. Adding a multiple of one row to another row

Using these operations, a matrix can always be transformed into an upper triangular matrix, and in fact one that is in row echelon form. Once all of the leading coefficients (the left-most non-zero entry in each row) are 1, and in every column containing a leading coefficient has zeros elsewhere, the matrix is said to be in reduced row echelon form. This final form is unique; in other words, it is independent of the sequence of row operations used. For example, in the following sequence of row operations (where multiple elementary operations might be done at each step), the third and fourth matrices are the ones in row echelon form, and the final matrix is the unique reduced row echelon form.

$$
\left[\begin{array}{rrr|r}
1 & 3 & 1 & 9 \\
1 & 1 & -1 & 1 \\
3 & 11 & 5 & 35
\end{array}\right]\to

\left[\begin{array}{rrr|r}
1 & 3 & 1 & 9 \\
0 & -2 & -2 & -8 \\
0 & 2 & 2 & 8
\end{array}\right]\to

\left[\begin{array}{rrr|r}
1 & 3 & 1 & 9 \\
0 & -2 & -2 & -8 \\
0 & 0 & 0 & 0
\end{array}\right]\to

\left[\begin{array}{rrr|r}
1 & 0 & -2 & -3 \\
0 & 1 & 1 & 4 \\
0 & 0 & 0 & 0
\end{array}\right] 
$$


