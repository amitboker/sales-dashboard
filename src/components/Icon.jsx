import barChart from "../assets/icons/bar-chart.svg";
import funnel from "../assets/icons/funnel.svg";
import users from "../assets/icons/users.svg";
import chat from "../assets/icons/chat.svg";
import calculator from "../assets/icons/calculator.svg";
import settings from "../assets/icons/settings.svg";
import logout from "../assets/icons/logout.svg";
import filter from "../assets/icons/filter.svg";
import chevronDown from "../assets/icons/chevron-down.svg";
import zap from "../assets/icons/zap.svg";
import fileDownload from "../assets/icons/file-download.svg";
import spreadsheet from "../assets/icons/spreadsheet.svg";
import trendingUp from "../assets/icons/trending-up.svg";
import dollar from "../assets/icons/dollar.svg";
import packageIcon from "../assets/icons/package.svg";
import trendingDown from "../assets/icons/trending-down.svg";
import clock from "../assets/icons/clock.svg";
import bell from "../assets/icons/bell.svg";
import alertCircle from "../assets/icons/alert-circle.svg";
import alertTriangle from "../assets/icons/alert-triangle.svg";
import checkCircle from "../assets/icons/check-circle.svg";
import trendUpLg from "../assets/icons/trend-up-lg.svg";
import chevronDownSm from "../assets/icons/chevron-down-sm.svg";
import close from "../assets/icons/close.svg";

const icons = {
  "bar-chart": barChart,
  funnel,
  users,
  chat,
  calculator,
  settings,
  logout,
  filter,
  "chevron-down": chevronDown,
  zap,
  "file-download": fileDownload,
  spreadsheet,
  "trending-up": trendingUp,
  dollar,
  package: packageIcon,
  "trending-down": trendingDown,
  clock,
  bell,
  "alert-circle": alertCircle,
  "alert-triangle": alertTriangle,
  "check-circle": checkCircle,
  "trend-up-lg": trendUpLg,
  "chevron-down-sm": chevronDownSm,
  close,
};

export default function Icon({ name, size = 20, className = "", style = {} }) {
  const src = icons[name];
  if (!src) return null;
  return (
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      className={`icon ${className}`}
      style={{ display: "inline-block", verticalAlign: "middle", ...style }}
    />
  );
}
