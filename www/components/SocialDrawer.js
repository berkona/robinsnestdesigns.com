import React from 'react'
import {
  Twitter,
  Facebook,
  Google,
  Tumblr,
  Pinterest,
  Mail,
  Linkedin,
  Reddit,
  Xing,
  Whatsapp,
  HackerNews,
  VK,
  Telegram
} from 'react-social-sharing'
import Button from 'react-bootstrap/Button'
import Collapse from 'react-bootstrap/Collapse'

export default ({ url, imageUrl }) => <div>
  <Facebook solid small link={url} />
  <Pinterest solid small link={imageUrl} />
  <Twitter solid small link={url} />
  <Mail solid small link={url} />
</div>
