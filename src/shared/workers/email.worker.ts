import { mailTransport } from '@service/emails/mail.transport';
import Logger from 'bunyan';
import { DoneCallback, Job } from 'bull';
import { config } from '@root/config';

const log: Logger = config.createLogger('emailWorker');

class EmailWorker {
  async addNotificationEmail(job: Job, done: DoneCallback): Promise<void> {
    try {
      const { template, receiverEmail, subject } = job.data;

      //send email
      await mailTransport.sendEmail(receiverEmail, subject, template);

      job.progress(100);
      done(null, job.data);
    } catch (error) {
      log.error(error);
      done(error as Error);
    }
  }
}

export const emailWorker: EmailWorker = new EmailWorker();
