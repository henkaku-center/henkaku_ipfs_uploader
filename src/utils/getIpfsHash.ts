import ipfs from '../ipfs/ipfs';
import pinata from '../ipfs/pinata';
import fs from "fs";

export const getTextIpfsHash = async (data: string) => {
  const content = await ipfs.Buffer.from(data);
  const result = await ipfs.add(content);
  const hash = await result[0].hash;
  console.log(hash);
  return hash;
};

export const getImageIpfsHash = async (data: ArrayBuffer) => {
  const result = await ipfs.files.add(data);
  const hash = await result[0].hash;
  return hash;
};

export const getSvgIpfsHash = async (data: string) => {
  const readableStreamForFile = Buffer.from(data);
  const hash = await pinata.pinFileToIPFS(readableStreamForFile)
  return hash;
};