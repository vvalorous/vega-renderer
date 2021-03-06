import Aws from 'aws-sdk';
import hash from 'object-hash';
import Rx from 'rxjs';
import {post$} from 'post';
import {spec$, png} from 'vg';

const s3 = new Aws.S3();
const upload$ = Rx.Observable.bindNodeCallback(s3.upload.bind(s3));

export default (event, ctx, cb) => {
  if (!event.spec) {
    return cb('Error: you should provide "spec" prop. Error.');
  }
  const {spec, isLite} = event;
  const filename = hash(spec);

  spec$(spec, isLite)
    .map(chart => png(chart, filename))
    .flatMap(params => upload$(params))
    .flatMap(data => post$(event, data.Location))
    .subscribe(result => {
      cb(null, result);
    }, err => {
      console.log(err);
      cb(err);
    });
};
