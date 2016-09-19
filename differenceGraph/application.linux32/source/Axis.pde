
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