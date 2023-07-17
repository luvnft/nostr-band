import {
  ArrowRight,
  ArrowRightCircleFill,
  LightningChargeFill,
} from "react-bootstrap-icons";
import cl from "./ZapTransfer.module.css";
import { formatAMPM } from "../../../utils/formatDate";
import UserIcon from "../../../assets/user.png";
import MarkdownComponent from "../../../components/MarkdownComponent/MarkdownComponent";
import { Link, useNavigate } from "react-router-dom";
import { nip19 } from "nostr-tools";
import Skeleton from "react-loading-skeleton";

const ZapTransfer = ({
  sender,
  receiver,
  amount,
  created,
  comment,
  zappedPost,
  provider,
  senderPubkey,
}) => {
  const createdAt = new Date(created * 1000);
  const data = formatAMPM(createdAt);
  const senderPk = nip19.npubEncode(senderPubkey);
  const navigate = useNavigate();

  return (
    <div className={cl.zap}>
      <div className={cl.zapSender}>
        <div className={cl.zapSenderAbout}>
          {sender.picture ? (
            <div className={cl.zapSenderImage}>
              <img
                src={sender.picture}
                onError={({ currentTarget }) =>
                  (currentTarget.srcset = UserIcon)
                }
                alt="avatar"
              />
            </div>
          ) : (
            <div className={cl.zapSenderImage}>
              <Skeleton circle width="100%" height="100%" />
            </div>
          )}
          {sender ? (
            <Link
              onClick={() => {
                navigate(`/${senderPk}`);
                window.location.reload();
              }}
            >
              {sender.displayName ? sender.displayName : sender.name}
            </Link>
          ) : (
            "Unknown"
          )}
        </div>
        <div className={cl.zapsAmount}>
          <LightningChargeFill
            color="yellow"
            stroke="orange"
            width="1.5rem"
            height="100%"
          />
          <span>
            {amount ? (
              <>
                {amount / 1000}
                <br />
                sats
              </>
            ) : (
              <Skeleton width={30} />
            )}
          </span>
          <ArrowRightCircleFill color="orange" width="1.8rem" height="100%" />
        </div>
        <div className={`${cl.zapSenderAbout} ${cl.rightSender}`}>
          <div className={cl.zapSenderImage}>
            <img
              src={receiver.image}
              alt="avatar"
              onError={({ currentTarget }) => (currentTarget.srcset = UserIcon)}
            />
          </div>
          <Link>
            {receiver.displayName ? receiver.displayName : receiver.name}
          </Link>
        </div>
      </div>
      {zappedPost && (
        <p>
          Zapped for: "{zappedPost.slice(0, 25)}...
          <Link>
            <ArrowRight fontWeight={900} />
          </Link>
          "
        </p>
      )}
      {comment && <MarkdownComponent content={comment} />}
      <div className={cl.createdTime}>
        {created ? (
          data
        ) : (
          <Skeleton width={100} style={{ marginRight: "5px" }} />
        )}{" "}
        to&nbsp;
        <Link>
          {provider.displayName ? provider.displayName : provider.name}
        </Link>
      </div>
    </div>
  );
};

export default ZapTransfer;
