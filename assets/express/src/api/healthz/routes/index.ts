import { attachPrefix } from '@common';
import { healthzLive } from './live';
import { healthzReady } from './ready';

export default function () {
  return attachPrefix([healthzLive, healthzReady], '/healthz');
}
