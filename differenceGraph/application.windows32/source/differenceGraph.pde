import java.util.Arrays;

Table table;
Axis xAxis;
Axis yAxis;
int hMargins = 80;
int vMargins = 60;
double difference = 0;

ArrayList<Vertex> vertices = new ArrayList<Vertex>();
ArrayList<Patient> patientList = new ArrayList<Patient>();

public void setup() {
  size(1400, 800);
  background(255);
  stroke(19, 135, 183);
  strokeWeight(1);
  fill(29, 174, 234);
  noLoop();

  //Table is pre-filtered for (Days_From1stTBI==0), all other variables consolidated(sum) into single rows identified by PatientID
  //Some of the colomns from original table are removed
  table = loadTable("ehrSample.csv", "header");
  println(table.getRowCount() + " total rows in table");


  for (TableRow row : table.rows()) {
    String patientID= row.getString("PatientID");

    if (!patientID.equals("INSIGHTS")) {
      Patient patient = new Patient(patientID, row.getString("Date of Injury"), row.getInt("PRE_max_days"), row.getInt("POST_max_days"), row.getInt("Age"));
      patientList.add(patient);
    } else {
      try {
        double[] maxDaysDomain = new double[]{
          0, (Math.ceil((row.getFloat("POST_max_days") - row.getFloat("PRE_max_days"))/500) * 500)
        };

        xAxis = new Axis(new double[]{0, patientList.size()}, new double[]{hMargins, width - hMargins});
        yAxis = new Axis(maxDaysDomain, new double[]{height - vMargins, vMargins});
      } 
      catch (IOException e) {
        println("Exception: " + e);
      }
    }
  }

  println("X:  [" + xAxis.domain()[0] + "," + xAxis.domain()[1] + "]  ->  [" + xAxis.range()[0] + "," + xAxis.range()[1] + "]");
  println("Y:  [" + yAxis.domain()[0] + "," + yAxis.domain()[1] + "]  ->  [" + yAxis.range()[0] + "," + yAxis.range()[1] + "]");

  for (int i = 0; i < patientList.size(); i++) {
    Patient p = patientList.get(i);
    Vertex v = new Vertex(xAxis.scale(i + 1), yAxis.scale(p.postMaxDays - p.preMaxDays));
    vertices.add(v);
    difference += p.postMaxDays - p.preMaxDays;
  }
}


void draw() {
  Vertex avgStart = new Vertex(xAxis.scale(xAxis.domain()[0]), yAxis.scale(difference/patientList.size()));
  Vertex avgEnd = new Vertex(xAxis.scale(xAxis.domain()[1]), yAxis.scale(difference/patientList.size()));
  Vertex v = avgStart;
  
  beginShape();
  //Initialize position before the graph begins, kepping xAxis scale origin at 0
  vertex(avgStart.x, avgStart.y);
  vertex(vertices.get(0).x, avgStart.y);

  //Generate Graphs
  for (int i = 0; i < vertices.size(); i++) {
    v = vertices.get(i);
    vertex(v.x, v.y);
  }

  //Close graph area
  vertex(v.x, avgEnd.y);
  vertex(avgEnd.x, avgEnd.y);
  vertex(avgStart.x, avgStart.y);
  endShape();

  createAxisNLabel();
}

void createAxisNLabel(){
  double domainSize;
  int loopCount;
  int xIntervals = 5, yIntervals = 500;
  
  //Average difference line label
  stroke(0);
  fill(100);
  text("Average Difference", xAxis.scale(xAxis.domain()[1] - xAxis.domain()[0]) - (0.104 * width), yAxis.scale(difference/patientList.size()) + (0.0167 * height));
  
  fill(0);
  //X Axis
  line(xAxis.scale(xAxis.domain()[0]), yAxis.scale(yAxis.domain()[0]), xAxis.scale(xAxis.domain()[1]), yAxis.scale(yAxis.domain()[0]));
  
  domainSize = xAxis.domain()[1] - xAxis.domain()[0];
  loopCount = (int)domainSize/xIntervals;
  textSize(11);
  
  //Generate xAxis ticks
  for (int i = 0; i<=loopCount; i++) {
    line(xAxis.scale(xAxis.domain()[0] + (xIntervals * i)), yAxis.scale(yAxis.domain()[0]), xAxis.scale(xAxis.domain()[0] + (xIntervals * i)), yAxis.scale(yAxis.domain()[0]) + (0.0056 * height));
    text((int)(xAxis.domain()[0] + (xIntervals * i)) + "", xAxis.scale(xAxis.domain()[0] + (xIntervals * i)) - (0.0035 * width), yAxis.scale(yAxis.domain()[0]) + (0.027 * height));
  }
  
  //X axis label
  textSize(16);
  fill(100);
  text("Patient #, sorted by Date of TBI encounter", (float)((xAxis.range()[1] - xAxis.range[0])/2 - (0.056 * width)), yAxis.scale(yAxis.domain()[0]) + (0.049 * height));
  
  
  //Y Axis
  fill(0);
  line(xAxis.scale(xAxis.domain()[0]), yAxis.scale(yAxis.domain()[0]), xAxis.scale(xAxis.domain()[0]), yAxis.scale(yAxis.domain()[1]));

  domainSize = yAxis.domain()[1] - yAxis.domain()[0];
  loopCount = (int)domainSize/yIntervals;
  textSize(11);
  fill(0);
  
  //Y axis ticks
  for (int i = 0; i<loopCount; i++) {
    line(xAxis.scale(xAxis.domain()[0]), yAxis.scale(yAxis.domain()[0] + (yIntervals * i)), xAxis.scale(xAxis.domain()[0]) - (0.0035 * width), yAxis.scale(yAxis.domain()[0] + (yIntervals * i)));
    text((int)(yAxis.domain()[0] + (yIntervals * i)) + "", xAxis.scale(xAxis.domain()[0]) - (width * 0.0264), yAxis.scale(yAxis.domain()[0] + (yIntervals * i)) + (0.0044 * height));
  }

  fill(100);
  //Y axis label
  textSize(16);
  rotate(-PI/2);
  text("Difference between \"POST_max_days\" and \"PRE_max_days\"", (float)((xAxis.range()[0] - xAxis.range[1])/2 - (0.028 * width)), yAxis.scale(yAxis.domain()[1]) - (0.0333 * height));
}