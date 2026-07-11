const browserSupportsPasskeys =
    typeof navigator.credentials !== 'undefined' &&
    typeof window.PublicKeyCredential !== 'undefined' &&
    typeof window.PublicKeyCredential.parseCreationOptionsFromJSON === 'function' &&
    typeof window.PublicKeyCredential.parseRequestOptionsFromJSON === 'function';

async function fetchWithErrorHandling(url, options = {}) {
    const response = await fetch(url, {
        credentials: 'include',
        ...options
    });
    if (!response.ok) {
        const text = await response.text();
        console.error(text);
        throw new Error(`The server responded with status ${response.status}.`);
    }
    return response;
}

async function createCredential(headers, signal) {
    const optionsResponse = await fetchWithErrorHandling('/Account/PasskeyCreationOptions', {
        method: 'POST',
        headers,
        signal,
    });
    const optionsJson = await optionsResponse.json();
    const options = PublicKeyCredential.parseCreationOptionsFromJSON(optionsJson);
    return await navigator.credentials.create({ publicKey: options, signal });
}

async function requestCredential(email, mediation, headers, signal) {
    const optionsResponse = await fetchWithErrorHandling(`/Account/PasskeyRequestOptions?username=${email}`, {
        method: 'POST',
        headers,
        signal,
    });
    const optionsJson = await optionsResponse.json();
    const options = PublicKeyCredential.parseRequestOptionsFromJSON(optionsJson);
    return await navigator.credentials.get({ publicKey: options, mediation, signal });
}

if (!customElements.get('passkey-submit')) {
    customElements.define('passkey-submit', class extends HTMLElement {
        static formAssociated = true;

        connectedCallback() {
            this.internals = this.attachInternals();
            this.attrs = {
                operation: this.getAttribute('operation'),
                name: this.getAttribute('name'),
                emailName: this.getAttribute('email-name'),
                requestTokenName: this.getAttribute('request-token-name'),
                requestTokenValue: this.getAttribute('request-token-value'),
            };

            this.internals.form.addEventListener('submit', (event) => {
                if (event.submitter?.name === '__passkeySubmit') {
                    event.preventDefault();
                    this.obtainAndSubmitCredential();
                }
            });

            this.tryAutofillPasskey();
        }

        disconnectedCallback() {
            this.abortController?.abort();
        }

        async obtainCredential(useConditionalMediation, signal) {
            if (!browserSupportsPasskeys) {
                throw new Error('Some passkey features are missing. Please update your browser.');
            }

            const headers = {
                [this.attrs.requestTokenName]: this.attrs.requestTokenValue,
            };

            if (this.attrs.operation === 'Create') {
                return await createCredential(headers, signal);
            } else if (this.attrs.operation === 'Request') {
                const email = new FormData(this.internals.form).get(this.attrs.emailName);
                const mediation = useConditionalMediation ? 'conditional' : undefined;
                return await requestCredential(email, mediation, headers, signal);
            } else {
                throw new Error(`Unknown passkey operation '${this.attrs.operation}'.`);
            }
        }

        async obtainAndSubmitCredential(useConditionalMediation = false) {
            this.abortController?.abort();
            this.abortController = new AbortController();
            const signal = this.abortController.signal;
            const formData = new FormData();
            try {
                const credential = await this.obtainCredential(useConditionalMediation, signal);

                const credentialData = this.serializeCredential(credential);

                const credentialJson = JSON.stringify(credentialData);
                formData.append(`${this.attrs.name}.CredentialJson`, credentialJson);

            } catch (error) {
                if (error.name === 'AbortError') {
                    // The user explicitly canceled the operation - return without error.
                    return;
                }
                console.error(error);
                if (useConditionalMediation) {
                    // An error occurred during conditional mediation, which is not user-initiated.
                    // We log the error in the console but do not relay it to the user.
                    return;
                }
                const errorMessage = error.name === 'NotAllowedError'
                    ? 'No passkey was provided by the authenticator.'
                    : error.message;
                formData.append(`${this.attrs.name}.Error`, errorMessage);
            }
            this.internals.setFormValue(formData);
            this.internals.form.submit();
        }

        serializeCredential(credential) {
            const toJson = credential?.toJSON ?? credential?.toJson;
            let credentialData = typeof toJson === 'function'
                ? toJson.call(credential)
                : undefined;

            if (!credentialData || typeof credentialData !== 'object') {
                credentialData = {};
            }

            // Some password managers do not implement PublicKeyCredential JSON serialization correctly,
            // which is required for JSON.stringify() to work.
            // e.g. https://www.1password.community/discussions/1password/typeerror-illegal-invocation-in-chrome-browser/47399
            // Use built-in serialization when available, then backfill any missing properties manually.
            credentialData.authenticatorAttachment ??= credential.authenticatorAttachment;
            credentialData.clientExtensionResults ??= credential.getClientExtensionResults?.();
            credentialData.id ??= credential.id;
            credentialData.rawId ??= this.convertToBase64(credential.rawId);
            credentialData.type ??= credential.type;

            credentialData.response ??= {};
            credentialData.response.attestationObject ??= this.convertToBase64(credential.response.attestationObject);
            credentialData.response.authenticatorData ??= this.convertToBase64(credential.response.authenticatorData ?? credential.response.getAuthenticatorData?.() ?? undefined);
            credentialData.response.clientDataJSON ??= this.convertToBase64(credential.response.clientDataJSON);
            credentialData.response.publicKey ??= this.convertToBase64(credential.response.getPublicKey?.() ?? undefined);
            credentialData.response.publicKeyAlgorithm ??= credential.response.getPublicKeyAlgorithm?.() ?? undefined;
            credentialData.response.transports ??= credential.response.getTransports?.() ?? undefined;
            credentialData.response.signature ??= this.convertToBase64(credential.response.signature);
            credentialData.response.userHandle ??= this.convertToBase64(credential.response.userHandle);

            return credentialData;
        }

        convertToBase64(o) {
            if (!o) {
                return undefined;
            }

            // Normalize Array to Uint8Array
            if (Array.isArray(o)) {
                o = Uint8Array.from(o);
            }

            // Normalize ArrayBuffer to Uint8Array
            if (o instanceof ArrayBuffer) {
                o = new Uint8Array(o);
            }

            // Convert Uint8Array to base64
            if (o instanceof Uint8Array) {
                let str = '';
                for (let i = 0; i < o.byteLength; i++) {
                    str += String.fromCharCode(o[i]);
                }
                o = window.btoa(str);
            }

            if (typeof o !== 'string') {
                throw new Error("Could not convert to base64 string");
            }

            // Convert base64 to base64url
            o = o.replace(/\+/g, "-").replace(/\//g, "_").replace(/=*$/g, "");

            return o;
        }

        async tryAutofillPasskey() {
            if (browserSupportsPasskeys && this.attrs.operation === 'Request' && await PublicKeyCredential.isConditionalMediationAvailable?.()) {
                await this.obtainAndSubmitCredential(/* useConditionalMediation */ true);
            }
        }
    });
}
