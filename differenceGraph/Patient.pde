import java.text.*;
import java.util.Date;

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