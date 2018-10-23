import React from "react"
import cx from "classnames"
import Field from "domainql-form/lib/Field";
import TextArea from "domainql-form/lib/TextArea";
import withForm from "domainql-form/lib/withForm";
import GlobalErrors from "domainql-form/lib/GlobalErrors";
import Icon from "../../components/Icon";
import config from "../../services/config";
import hasRole from "../../util/hasRole";


class FooForm extends React.Component {

    render()
    {
        const { authentication } = config();

        const { formConfig } = this.props;

        const { formikProps } = formConfig;

        const {isValid, values, errors} = formikProps;

        // for our badly secured frontend, we just change the color of the button and do
        // not disable it like we should.
        const canAccess = authentication.id === values.ownerId || hasRole("ROLE_ADMIN");

        return (
            <React.Fragment>
                <GlobalErrors/>
                <Field name="name"/>
                <TextArea name="description"/>
                <Field name="num"/>

                <div>
                    <button
                        type="reset"
                        className="btn btn-secondary"
                    >
                        <Icon className="fa-recycle"/>
                        { " " }
                        Reset
                    </button>
                    { " " }
                    <button
                        type="submit"
                        className={
                            cx(
                                "btn",
                                canAccess ? "btn-success" : "btn-danger"
                            )
                        }
                    >
                        <Icon className="fa-save"/>
                        { " " }
                        Save
                    </button>
                </div>
            </React.Fragment>
        );
    }
}

export default withForm(
    FooForm,
    {
        type: "FooInput"
    }
);
