const axios = require('axios');
const FormData = require('form-data');

export const getPngIpfsHash = async (blob: Blob, fileName: string) => {
  let data = new FormData();
  data.append('file', blob);

  const metadata = JSON.stringify({name: fileName});
  data.append('pinataMetadata', metadata);

  const apiPromise = axios
  .post('https://api.pinata.cloud/pinning/pinFileToIPFS', data, {
      maxBodyLength: 'Infinity', //this is needed to prevent axios from erroring out with large files
      headers: {
          'Content-Type': `multipart/form-data; boundary=${data._boundary}`,
          pinata_api_key: process.env.REACT_APP_PINATA_API_KEY,
          pinata_secret_api_key: process.env.REACT_APP_PINATA_SECRET_API_KEY
      }
  })

  const result = await apiPromise;
  return result.data.IpfsHash;
};


