import styled from '@emotion/styled/macro';

type WordSwitchProps = {
  on: string;
  off: string;
  checked: boolean;
  onChange: React.ChangeEventHandler<HTMLInputElement> | undefined;
};

export const WordSwitch = ({
  on = 'All',
  off = 'Only Audited',
  checked = false,
  onChange,
}: WordSwitchProps) => {
  return (
    <CheckBoxWrapper>
      <CheckBoxLabelWrapper>
        <CheckBox id="checkbox" type="checkbox" checked={checked} onChange={onChange} />
        <CheckBoxLabel htmlFor="checkbox" data-on={on} data-off={off} />
      </CheckBoxLabelWrapper>
    </CheckBoxWrapper>
  );
};

const CheckBoxWrapper = styled.div`
  position: relative;
`;

const CheckBoxLabel = styled.label`
  position: absolute;
  top: 0;
  left: 0;
  width: 42px;
  height: 26px;
  background: rgba(244, 245, 248, 0.4);
  cursor: pointer;

  font-family: 'Satoshi-Regular', serif;
  font-style: normal;
  font-weight: 500;
  font-size: 14px;
  line-height: 20px;

  &:before {
    content: attr(data-on);
    position: absolute;
    top: 5px;
    right: 20px;
  }

  &:after {
    content: attr(data-off);
    width: 40px;
    height: 25px;
    padding: 3px;
    background: #fff1f2;
    color: #f43f5e;
    border-radius: 6px;
    position: absolute;
    left: 2px;
    top: 2px;
    text-align: center;
    transition: all 0.3s ease;
    box-shadow: 0 0 6px -2px #f43f5e;
  }
`;
const CheckBox = styled.input`
  cursor: pointer;
  width: 50px;
  height: 25px;
  opacity: 0;
  position: absolute;
  top: 0;
  z-index: 1;
  margin: 0;

  &:checked + ${CheckBoxLabel} {
    background: rgba(244, 245, 248, 0.4);
    border: 1px solid #d1d5db;
    box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.1);
    border-radius: 6px;

    &:before {
      content: attr(data-off);
      right: auto;
      left: 20px;
      width: 40px;
    }

    &:after {
      content: attr(data-on);
      left: 46px;
      width: 100px;
      background: #fff1f2;
    }
  }
`;

const CheckBoxLabelWrapper = styled.label`
  > ${CheckBoxLabel} {
    margin: 0;
    width: 150px;
    height: 30px;
    background: rgba(244, 245, 248, 0.4);
    border: 1px solid #d1d5db;
    box-shadow: inset 0 2px 2px rgba(0, 0, 0, 0.1);
    border-radius: 6px;
    overflow: hidden;
    position: relative;
    display: block;
  }
`;
