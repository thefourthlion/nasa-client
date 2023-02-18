import "../styles/MrpDateForm.scss";import "../styles/Mrp.scss";import "../styles/Epic.scss";import "../styles/Apod.scss";import "../styles/Navigation.scss";
import "../styles/EpicDateForm.scss";
import "../styles/ApodDateForm.scss";
import "../styles/globals.scss";
import Navigation from "../components/Navigation";
function MyApp({ Component, pageProps }) {
  return (
    <>
      <Navigation />
      <Component {...pageProps} />
    </>
  );
}
export default MyApp;
