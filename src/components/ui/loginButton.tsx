'use client';

import { Button } from '@chakra-ui/react';
import { usePrivy } from '@privy-io/react-auth';

const LoginButton = () => {
    const { login } = usePrivy();

    return <Button onClick={() => login()}>LOGIN</Button>;
};

export default LoginButton;
