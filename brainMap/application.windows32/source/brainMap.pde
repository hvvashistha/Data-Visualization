ArrayList<ArrayList<Float>> brainMap = new ArrayList<ArrayList<Float>>();
Axis yAxis;
float x1, x2, z1, z2, x1z1, x1z2, x2z1, x2z2, cx1z1, cx2z1, cx1z2, cx2z2;
float v = 0, minY = 0, maxY = 0;

void setup() {
  String[] mapData = loadStrings("DTI.txt");
  float y = 0;
  yAxis = new Axis(new double[]{0, 1}, new double[]{5, 0});
  
  for(String mapRow : mapData) {
    ArrayList<Float> brainMapRow = new ArrayList<Float>(); 
    for(String dataPoint : mapRow.split(" ")) {
      y = (float)Math.pow(yAxis.scale(Float.parseFloat(dataPoint)), 3);
      brainMapRow.add(y);
      minY = Math.min(minY, y);
      maxY = Math.max(Float.parseFloat(dataPoint), maxY);
    }
    brainMap.add(brainMapRow);
  }
  print(maxY);
  size(1440,800,P3D);
  fill(0);
  noStroke();
}


void draw() {
  background(0);
  lights();
  ambientLight(255, 255, 255, -400, -400, -400);
  camera(0, -1000, map(mouseY, 0, height, -height * 1.5, height), 0, 0, 0, 0, 0, -1);
  pushMatrix();
  
  int xLength = brainMap.size();
  int zLength = brainMap.get(0).size();
  
  rotateX(-PI/5);
  rotateY(PI * map(mouseX, 0, width, 4, 2));
  translate(-5 * xLength/2, 0, -5 * zLength/2);
  
  legend();
  
  for(int x = 1; x < xLength; x++) {
    for(int z = 1; z < zLength; z++) {
      x1 = 5 * (x-1); x2 = 5 * x; z1 = 5 * (z-1); z2 = 5 * z;
      x1z1 = brainMap.get(x-1).get(z-1);
      x1z2 = brainMap.get(x-1).get(z);
      x2z1 = brainMap.get(x).get(z-1);
      x2z2 = brainMap.get(x).get(z);
      cx1z1 = cMap(x1z1); cx2z1 = cMap(x2z1); cx1z2 = cMap(x1z2); cx2z2 = cMap(x2z2);
      
      //Generate shape and shade
      beginShape();
        stroke(cx1z1);
        fill(cx1z1);
        vertex(x1, x1z1, z1);
        
        stroke(cx1z2);
        fill(cx1z2);
        vertex(x1, x1z2, z2);
        
        stroke(cx2z2);
        fill(cx2z2);
        vertex(x2, x2z2, z2);
        
        stroke(cx2z1);
        fill(cx2z1);
        vertex(x2, x2z1, z1);
      endShape();
    }
  }
  
  fill(255);
  translate(20 * 5, 0, (zLength - 20) * 5);
  textSize(18);
  text(maxY, 10, minY, 10);
  translate(0, 62, 0);
  box(10, 125, 10);
  
  popMatrix();
}

void legend(){
  int legendX = brainMap.size()/2 * 5;
  int legendZ = 0;
  int legendLen = 400;
  
  fill(255);
  textSize(30);
  text("[0,1]->[0, 5]^3", legendX - 100, -130, legendZ);
  textSize(40);
  text("0", legendX - (legendLen/2) - 40, -70, legendZ);
  
  text((int)Math.pow(yAxis.scale(0), 3) + "", legendX + (legendLen/2) + 20, -70, legendZ);
  //Generate legend
    beginShape();
        fill(cMap(125));
        vertex(legendX - (legendLen/2), -100, legendZ);
        vertex(legendX - (legendLen/2), -70, legendZ + 30);
        
        fill(cMap(0));
        vertex(legendX + (legendLen/2), -70, legendZ + 30);
        vertex(legendX + (legendLen/2), -100, legendZ);
    endShape();
  
}

float cMap(float y) {
  return map(y, 125, 0, 10, 255);
}