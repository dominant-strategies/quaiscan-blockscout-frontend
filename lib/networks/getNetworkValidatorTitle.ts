import config from 'configs/app';

export default function getNetworkValidatorTitle() {
  return config.chain.verificationType === 'validation' ? 'validators' : 'miners';
}
