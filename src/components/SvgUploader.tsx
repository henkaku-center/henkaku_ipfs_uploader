import React, { FC, useState } from 'react';
import { Form, Button, Segment, Message } from 'semantic-ui-react';
import { getSvgIpfsHash } from '../utils/getIpfsHash';
import henkakuBaseSVG from '../resources/henkaku_membership';

const SvgUpLoader: FC = () => {
  const [resultHash, setResultHash] = useState('');
  const [load, setLoad] = useState<boolean>(true);
  const [end, setEnd] = useState(false);
  const [user, setUser] = useState({ name: "", address: "", point: "", profileUrl: "", role: ""});

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoad(false);

    const domParser = new DOMParser();
    const parsedSVGDoc = domParser.parseFromString(henkakuBaseSVG, 'image/svg+xml');

    const jstNow = new Date(Date.now() + ((new Date().getTimezoneOffset() + (9 * 60)) * 60 * 1000));
    parsedSVGDoc.getElementById("henkaku_published_date")!.textContent = jstNow.getFullYear() + "." + ("00" + (jstNow.getMonth()+1)).slice(-2) + "." + ("00" + jstNow.getDate()).slice(-2);
    parsedSVGDoc.getElementById("henkaku_point")!.textContent = "$" + user.point + "Henkaku"
    parsedSVGDoc.getElementById("henkaku_role")!.textContent = user.role
    parsedSVGDoc.getElementById('henkaku_profile_pic')!.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', user.profileUrl);

    var walletAddress = user.address
    if (user.address.lastIndexOf(".eth") == -1) {
      var strHead  = user.address.slice(0,4);
      var strFoot  = user.address.slice(-3);
      walletAddress = strHead + "..." + strFoot
    }
    parsedSVGDoc.getElementById("henkaku_member_wallet")!.textContent = walletAddress

    var userName = user.name
    if (userName.length > 10) {
      userName = userName.slice(0,9) + "..."
    }
    parsedSVGDoc.getElementById("henkaku_member_name")!.textContent = userName

    const svg = new XMLSerializer().serializeToString(parsedSVGDoc)
    const res = await getSvgIpfsHash(svg);
    setResultHash(res);
    setEnd(true);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setUser({ ...user, [event.target.name]: event.target.value });
  };

  return (
    <>
      <h1>Henkaku Membership Uploader</h1>
      <Segment.Group>
        <Segment>
          <Form onSubmit={handleSubmit}>
            <Form.Field>
            <label htmlFor="userName">User Name</label>
            <input type="text" name="name" onChange={handleChange} />
            <label htmlFor="address">Wallet Address</label>
            <input type="text" name="address" onChange={handleChange} />
            <label htmlFor="profileUrl">Profile Pic URL</label>
            <input type="text" name="profileUrl" onChange={handleChange} />
            <label htmlFor="role">Role</label>
            <input type="text" name="role" onChange={handleChange} />
            <label htmlFor="point">Point</label>
            <input type="number" name="point" onChange={handleChange}/>
            </Form.Field>
            <Button type="submit">Submit</Button>
          </Form>
          {load ? <></> : <Message as="h3">Uploading...</Message>}
          {end ? <Message positive>End</Message> : <></>}
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
        </Segment>
      </Segment.Group>
    </>
  );
};

export default SvgUpLoader;
