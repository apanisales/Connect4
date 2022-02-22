import styled from "styled-components";

const CustomButton = styled.button`
    background-color: #001f3f;
    color: white;
    font-size: 1.2rem;
    padding: 0.5rem 1rem;
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
