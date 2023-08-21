import { Route, Routes } from "react-router-dom";
import "./App.css";
import Footer from "./components/Footer/Footer";
import Header from "./components/Header/Header";
import { allRoutes } from "./routes";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ReactModal from "react-modal";
import { Button } from "react-bootstrap";
import { X } from "react-bootstrap-icons";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useSelector, useDispatch } from "react-redux";
import { userSlice } from "./store/reducers/UserSlice";
import NDK from "@nostrband/ndk";
import React from "react";

const App = () => {
  const [isModal, setIsModal] = useState<boolean>(false);
  const closeModal = (): void => setIsModal(false);
  const stote = useSelector((store: any) => store.userReducer);
  const dispatch = useDispatch();
  const { setIsAuth, setContacts } = userSlice.actions;

  const getUser = async (pubkey: string): Promise<void> => {
    const ndk = new NDK({ explicitRelayUrls: ["wss://relay.nostr.band"] });
    ndk.connect();
    const contacts = Array.from(
      await ndk.fetchEvents({ kinds: [3], authors: [pubkey] })
    )[0];
    dispatch(setContacts(contacts));
  };

  useEffect(() => {
    const pubkey = localStorage.getItem("login");
    if (pubkey) {
      getUser(pubkey);
    }
  }, [stote.isAuth]);

  const loginBtn = async (): Promise<void> => {
    if (window.nostr) {
      const pubkey = await window.nostr.getPublicKey();
      dispatch(setIsAuth(true));
      localStorage.setItem("login", pubkey);
      setIsModal(false);
    } else {
      toast.error("Browser extension not found!", { autoClose: 3000 });
      setIsModal(false);
    }
  };

  return (
    <Container>
      <ReactModal
        isOpen={isModal}
        onAfterOpen={() => {
          document.body.style.overflow = "hidden";
        }}
        onAfterClose={() => {
          document.body.style.overflow = "auto";
        }}
        onRequestClose={closeModal}
        ariaHideApp={false}
        className="login-modal"
        style={{ overlay: { zIndex: 6 } }}
      >
        <div className="modal-header">
          <h4>Login</h4>
          <Button
            variant="link"
            style={{ fontSize: "1.8rem", color: "black" }}
            onClick={closeModal}
          >
            <X />
          </Button>
        </div>
        <hr />
        <div className="modal-body">
          <div>
            <Button variant="outline-primary" onClick={loginBtn}>
              Login with browser extension
            </Button>
          </div>
          <p className="mt-2">
            Please login using Nostr browser extension. You can try{" "}
            <a href="https://getalby.com/" target="_blank">
              Alby
            </a>
            ,{" "}
            <a
              href="https://chrome.google.com/webstore/detail/nos2x/kpgefcfmnafjgpblomihpgmejjdanjjp"
              target="_blank"
            >
              nos2x
            </a>{" "}
            or{" "}
            <a
              href="https://testflight.apple.com/join/ouPWAQAV"
              target="_blank"
            >
              Nostore
            </a>{" "}
            (for Safari).
          </p>
        </div>
        <hr />
        <div className="modal-footer">
          <Button variant="secondary" onClick={closeModal}>
            Close
          </Button>
        </div>
      </ReactModal>
      <ToastContainer />
      <Row className="justify-content-lg-center">
        <Col lg={9}>
          <Header onLogin={setIsModal} />
          <Routes>
            {allRoutes.map((route) => {
              return (
                <Route
                  key={route.path}
                  path={route.path}
                  element={<route.Component />}
                />
              );
            })}
          </Routes>
          <Footer />
        </Col>
      </Row>
    </Container>
  );
};

export default App;
