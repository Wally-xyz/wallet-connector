import { useCallback, useEffect, useRef, useState } from "react";
import detectEthereumProvider from '@metamask/detect-provider';
import { MetaMaskInpageProvider } from '@metamask/providers';

import { WallyConnector } from "../../dist";

import Connect from "components/connect";
import Sign from 'components/sign';

import styles from "styles/Home.module.css";


export default function Home() {
  const [isUsingWally, setIsUsingWally] = useState(true);
  const [provider, setProvider] = useState<MetaMaskInpageProvider | any>(null);
  const [address, setAddress] = useState(null);

  const detectProvider = useCallback(() => {
    if (isUsingWally) {
      return Promise.resolve(
        new WallyConnector(
          process.env.NEXT_PUBLIC_CLIENT_ID,
          {
            isDevelopment: process.env.NEXT_PUBLIC_IS_DEVELOPMENT === 'true',
          }
        )
      )
    } else {
      return detectEthereumProvider();
    }
  }, [isUsingWally])

  useEffect(() => {
    detectProvider().then(p => {
      if (p) {
        setProvider(p as MetaMaskInpageProvider);
      }
    });
  }, [isUsingWally]);

  useEffect(() => {
    if (provider && provider.selectedAddress) {
      setAddress(provider.selectedAddress);
    }
  }, [provider])

  useEffect(() => {
    if (isUsingWally && provider && provider.isRedirected()) {
      provider.handleRedirect();
    }
  }, [isUsingWally, provider]);

  const onWallyClick = () => {
    provider.loginWithEmail()
  };

  const onChange = e => {
    setIsUsingWally(e.target.value === "wally");
  };

  return (
    <>
      <h1 className={styles.title}>EasySign Demo</h1>
      <span>
        Use <input type="radio" name="provider" value="metamask" checked={!isUsingWally} onChange={onChange}/>MetaMask
        <input type="radio" name="provider" value="wally" checked={isUsingWally} onChange={onChange}/>Wally
        {isUsingWally ? <button onClick={onWallyClick}>Login</button> : null }
      </span>
      {address
        ? <Sign provider={provider} address={address}/>
        : <Connect
          provider={provider}
          setAddress={setAddress}
        />
      }
    </>
  );
}
