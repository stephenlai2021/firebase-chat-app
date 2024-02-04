/* components */
import Main from '@/Main'

function HomePage() {
  /* get user credential from server and protect route */

  return (
    <Main userCredential={userCredential} />
  );
}

export default HomePage;
