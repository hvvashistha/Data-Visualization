import processing.core.*; 
import processing.data.*; 
import processing.event.*; 
import processing.opengl.*; 

import java.util.Arrays; 
import java.text.*; 
import java.util.Date; 

import java.util.HashMap; 
import java.util.ArrayList; 
import java.io.File; 
import java.io.BufferedReader; 
import java.io.PrintWriter; 
import java.io.InputStream; 
import java.io.OutputStream; 
import java.io.IOException; 

public class differenceGraph extends PApplet {



Table table;
Axis xAxis;
Axis yAxis;
int hMargins = 80;
int vMargins = 60;
double difference = 0;

ArrayList<Vertex> vertices = new ArrayList<Vertex>();
ArrayList<Patient> patientList = new ArrayList<Patient>();

public void setup() {
  
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


public void draw() {
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

public void createAxisNLabel(){
  double domainSize;
  int loopCount;
  int xIntervals = 5, yIntervals = 500;
  
  //Average difference line label
  stroke(0);
  fill(100);
  text("Average Difference", xAxis.scale(xAxis.domain()[1] - xAxis.domain()[0]) - (0.104f * width), yAxis.scale(difference/patientList.size()) + (0.0167f * height));
  
  fill(0);
  //X Axis
  line(xAxis.scale(xAxis.domain()[0]), yAxis.scale(yAxis.domain()[0]), xAxis.scale(xAxis.domain()[1]), yAxis.scale(yAxis.domain()[0]));
  
  domainSize = xAxis.domain()[1] - xAxis.domain()[0];
  loopCount = (int)domainSize/xIntervals;
  textSize(11);
  
  //Generate xAxis ticks
  for (int i = 0; i<=loopCount; i++) {
    line(xAxis.scale(xAxis.domain()[0] + (xIntervals * i)), yAxis.scale(yAxis.domain()[0]), xAxis.scale(xAxis.domain()[0] + (xIntervals * i)), yAxis.scale(yAxis.domain()[0]) + (0.0056f * height));
    text((int)(xAxis.domain()[0] + (xIntervals * i)) + "", xAxis.scale(xAxis.domain()[0] + (xIntervals * i)) - (0.0035f * width), yAxis.scale(yAxis.domain()[0]) + (0.027f * height));
  }
  
  //X axis label
  textSize(16);
  fill(100);
  text("Patient #, sorted by Date of TBI encounter", (float)((xAxis.range()[1] - xAxis.range[0])/2 - (0.056f * width)), yAxis.scale(yAxis.domain()[0]) + (0.049f * height));
  
  
  //Y Axis
  fill(0);
  line(xAxis.scale(xAxis.domain()[0]), yAxis.scale(yAxis.domain()[0]), xAxis.scale(xAxis.domain()[0]), yAxis.scale(yAxis.domain()[1]));

  domainSize = yAxis.domain()[1] - yAxis.domain()[0];
  loopCount = (int)domainSize/yIntervals;
  textSize(11);
  fill(0);
  
  //Y axis ticks
  for (int i = 0; i<loopCount; i++) {
    line(xAxis.scale(xAxis.domain()[0]), yAxis.scale(yAxis.domain()[0] + (yIntervals * i)), xAxis.scale(xAxis.domain()[0]) - (0.0035f * width), yAxis.scale(yAxis.domain()[0] + (yIntervals * i)));
    text((int)(yAxis.domain()[0] + (yIntervals * i)) + "", xAxis.scale(xAxis.domain()[0]) - (width * 0.0264f), yAxis.scale(yAxis.domain()[0] + (yIntervals * i)) + (0.0044f * height));
  }

  fill(100);
  //Y axis label
  textSize(16);
  rotate(-PI/2);
  text("Difference between \"POST_max_days\" and \"PRE_max_days\"", (float)((xAxis.range()[0] - xAxis.range[1])/2 - (0.028f * width)), yAxis.scale(yAxis.domain()[1]) - (0.0333f * height));
}

class Axis {
  private double[] domain = null;
  private double[] range = null;
  private double ratio = 0;
  
  public Axis(double[] domain, double[] range) throws IOException {
    if (domain.length != 2 && range.length != 2) {
      throw new IOException("domain or range not acceptable");
    }
    this.domain = domain;
    this.range = range;
    this.ratio = (range[1] - range[0])/(domain[1] - domain[0]);
  }
  
  public double[] domain() {
    return new double[]{this.domain[0], this.domain[1]};
  }
  
  public double[] range() {
    return new double[]{this.range[0], this.range[1]};
  }
  
  public float scale(double domainValue) {
    return (float)(this.range[0] + ((domainValue - this.domain[0]) * ratio));
  }
}



public class Patient {
  private Date dateOfInjury;
  private String id;
  private int preMaxDays, postMaxDays;
  private int age;
  
  public Patient(String id, String dateOfInjury, int preMaxDays, int postMaxDays, int age){
    DateFormat dateFormat = new SimpleDateFormat("MM/dd/yyyy");
    try {
      this.id = id;
      this.dateOfInjury = dateFormat.parse(dateOfInjury);
      this.preMaxDays = preMaxDays;
      this.postMaxDays = postMaxDays;
      this.age = age;
    } catch (ParseException e) {
      println("Exception: " + e);
    }
  }
  
  public String getPatientID(){
    return this.id;
  }
  
  public int getAge() {
    return age;
  }
  
  public Date getDOI(){
    return this.dateOfInjury;
  }
  
  public int[] getMaxDaysRange(){
    return new int[]{this.preMaxDays, this.postMaxDays};
  }
}
class Vertex{
  public float x;
  public float y;
  
  public Vertex(double x, double y) {
    this.x = (float)x;
    this.y = (float)y;
  }
  
  public Vertex(float x, float y) {
    this.x = x;
    this.y = y;
  }
}
  public void settings() {  size(1400, 800); }
  static public void main(String[] passedArgs) {
    String[] appletArgs = new String[] { "differenceGraph" };
    if (passedArgs != null) {
      PApplet.main(concat(appletArgs, passedArgs));
    } else {
      PApplet.main(appletArgs);
    }
  }
}
