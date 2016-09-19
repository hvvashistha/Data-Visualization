Steps to reproduce:
---------------
    Select application folder based on your system platform.
    Run differenceGraph application.

Note: There are also screenshots present in ./screenshots directory in case it
doesn't work.


JUSTIFICATIONS:
---------------
**Data choice Justification**
* Data for this chart is from mTBI dataset. It was chosen as an experiment to
to visualize mTBI matrix as a 3D representation, and two determine feasibilities
of 3D charts for such kind of data.
Color representation for FA values are scaled from
[0,1] -> [5, 0] and raised to power 3. This is done because most FA values
present in dataset are < 0.5, scaling them this way increases the depth of these
values much more than 0s, which are not needed in visualization.

**Color choice?**
Color used here is gray scale and is proportional to the scaled depth of FA
values. GrayScale on a black background provides for excellent contrast between
zero and non-zero values than any other color.


**Is Processing good for this chart?**
Yes, Processing is excellent for learning and starting with 3D representations
and 3D rendering. Although, it is not very good for charting purposes but in
this case the overhead of generating 3D graph in any other environment which
only supports 2D might be more than graphing with processing in 3D.