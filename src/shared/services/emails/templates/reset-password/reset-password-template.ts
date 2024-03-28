import { IResetPasswordParams } from '@user/interfaces/user.interface';
import fs from 'fs';
import ejs from 'ejs';


class ResetPasswordTemplate {
  public passwordResetConfirmationTemplate(templateParams: IResetPasswordParams): string {
    const { username, email, ipaddress, date} = templateParams;
    return ejs.render(fs.readFileSync(__dirname+'/reset-password-template.ejs', 'utf8'),{
      username,
      email,
      ipaddress,
      date,
      image_url: 'https://images.unsplash.com/photo-1555529902-5261145633bf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
    });
  }
}

export const resetPasswordTemplate: ResetPasswordTemplate = new ResetPasswordTemplate();
