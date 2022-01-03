import styled from "styled-components";

const CustomButton = styled.button`
    background-color: black;
    color: white;
    font-size: 1.2rem;
    padding: 1rem 2rem;
    border-radius: 5px;
    margin: 1rem 1rem;
    cursor: pointer;
    font-family: 'Dekko';

    &:hover {
      color: grey;
      cursor: pointer;
    }

    &:disabled {
      color: grey;
      opacity: 0.7;
      cursor: default;
    }
  `;

export { CustomButton };
