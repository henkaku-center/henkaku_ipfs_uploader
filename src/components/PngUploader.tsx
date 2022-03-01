import React, { FC, useRef, useState } from 'react';
import { Canvg } from 'canvg';
import { Form, Button, Segment, Message } from 'semantic-ui-react';
import { getPngIpfsHash } from '../utils/getIpfsHash';
import henkakuBaseSVG from '../resources/henkaku_membership';

const PngUpLoader: FC = () => {
  const nameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLInputElement>(null);
  const pointRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const [profileBase64, setProfileBase64] = useState<string>('');
  const [width, height] = [3400, 3400];
  const [cardSvg, setCardSvg] = useState<string>('');
  const [resultHash, setResultHash] = useState<string>('');
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploaded, setUploaded] = useState(false);

  const getBase64ImageFromUrl = async(imageUrl: string): Promise<any> => new Promise(resolve => {
    fetch(imageUrl).then(res=>res.blob()).then(blob=>{
      const reader = new FileReader();
      reader.addEventListener('load',()=>{
        resolve(reader.result);
      });
      reader.readAsDataURL(blob);
    })
  });

  const getBlob = (canvas: HTMLCanvasElement): Promise<any> => {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, 'image/png');
    });
  }

  const updateSvg = async ({name = '', address = '', role = '', point = ''}): Promise<string> => {
    const domParser = new DOMParser();
    const parsedSVGDoc = domParser.parseFromString(henkakuBaseSVG, 'image/svg+xml');

    const jstNow = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    parsedSVGDoc.getElementById('henkaku_published_date')!.textContent = jstNow.getFullYear() + '.' + ('00' + (jstNow.getMonth()+1)).slice(-2) + '.' + ('00' + jstNow.getDate()).slice(-2);
    parsedSVGDoc.getElementById('henkaku_point')!.textContent = '$' + point + 'Henkaku';
    parsedSVGDoc.getElementById('henkaku_role')!.textContent = role;

    if (profileBase64) {
      parsedSVGDoc.getElementById('henkaku_profile_pic')!.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', profileBase64);
    }

    let walletAddress = address;
    if (walletAddress.lastIndexOf('.eth') === -1) {
      const strHead  = walletAddress.slice(0,4);
      const strFoot  = walletAddress.slice(-3);
      walletAddress = strHead + '...' + strFoot
    }
    parsedSVGDoc.getElementById('henkaku_member_wallet')!.textContent = walletAddress

    let userName = name;
    if (userName.length > 10) {
      userName = userName.slice(0,9) + '...'
    }
    parsedSVGDoc.getElementById('henkaku_member_name')!.textContent = userName

    const svgString = new XMLSerializer().serializeToString(parsedSVGDoc);
    setCardSvg(svgString);

    return svgString;
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setUploading(true);

    const svg = await updateSvg({
      name: nameRef.current?.value,
      address: addressRef.current?.value,
      role: roleRef.current?.value,
      point: pointRef.current?.value,
    });
    const canvas: HTMLCanvasElement = document.createElement('canvas')!;
    canvas.width = width;
    canvas.height = height;
    const c = Canvg.fromString(canvas.getContext('2d')!, svg);
    await c.render();

    const res = await getPngIpfsHash(await getBlob(canvas), nameRef.current?.value ?? '');
    setResultHash(res);

    setUploading(false);
    setUploaded(true);
  };

  const handleChangeProfileUrl = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfileBase64(await getBase64ImageFromUrl(event.target.value))
  };

  const handleBlur = async (event: React.FocusEvent<HTMLInputElement>) => {
    await updateSvg({
      name: nameRef.current?.value,
      address: addressRef.current?.value,
      role: roleRef.current?.value,
      point: pointRef.current?.value,
    });
  }

  return (
    <>
      <h1>Henkaku Membership Uploader</h1>
      <Segment.Group>
        <Segment>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
            <label htmlFor="name">User Name</label>
            <input type="text" name="name" ref={nameRef} onBlur={handleBlur} />
            <label htmlFor="address">Wallet Address</label>
            <input type="text" name="address" ref={addressRef} onBlur={handleBlur} />
            <label htmlFor="profileUrl">Profile Pic URL</label>
            <input type="text" name="profileUrl" onChange={handleChangeProfileUrl} onBlur={handleBlur} />
            <label htmlFor="role">Role</label>
            <input type="text" name="role" ref={roleRef} onBlur={handleBlur} />
            <label htmlFor="point">Point</label>
            <input type="number" name="point" ref={pointRef} onBlur={handleBlur} />
            </Form.Field>
            <Button type="submit">Submit</Button>
          </Form>
          {uploading ? <Message as="h3">Uploading...</Message> : <></>}
          {uploaded ? <Message positive>End</Message> : <></>}
          <Segment>IPFS Hash : {resultHash}</Segment>
          <Segment>
            IPFS Link is{' '}
            <a
              href={`https://gateway.pinata.cloud/ipfs/${resultHash}`}
              target="_blank"
              rel="noreferrer noopener"
            >
              here
            </a>
          </Segment>
          {cardSvg && (
            <img src={'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(cardSvg)} alt="Preview" width={500} height={500} />
          )}
        </Segment>
      </Segment.Group>
    </>
  );
};

export default PngUpLoader;
