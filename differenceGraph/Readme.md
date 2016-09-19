Steps to reproduce:
---------------
    Select application folder based on your system platform.
    Run differenceGraph application.

Note: There are also screenshots present in ./screenshots directory in case it
doesn't work.


JUSTIFICATIONS:
---------------
**Data choice Justification**
* This chart is a difference graph between the data attributes "POST_max_days"
and "PRE_max_days". The choice is made so as to show that the records does not
have same time intervals. Hence, It is not a very good dataset to draw
conclusions but only to be used for practice. Total number of patients are also
limited to 40, a large number of patient otherwise might have had an averaging
out effect.

**Color choice?**
There is only single color used in this chart which is easy on eyes. Color here
represents the area under the graph.


**Is Processing good for this chart?**
No, Processing is not very good for charting purposes. Processing is far better
to create more complex simulations, renders in both 2D and 3D space. Using it
for charting purposes is too much of an overkill. It lacks the supporting tools
required for general purpose charting, such as scales and axes,
which have to be written for processing.