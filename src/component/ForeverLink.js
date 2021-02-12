import React, { useEffect, useState } from 'react';

function ForeverLink(props) {
    let [validHref, setValidHref] = useState(props.href);

    function checkForAlternative() {
        fetch('http://archive.org/wayback/available?url=' + validHref).
            then(response => {
                return response.json();
            })
            .then(data => {
                const archivedSnapshots = data.archived_snapshots;

                if (archivedSnapshots && Object.keys(archivedSnapshots).length > 0) {
                    setValidHref(archivedSnapshots?.closest?.url);
                }
                else if (props.invalidate) {
                    setValidHref(null);
                }
            });
    }

    useEffect(() => {
        try {
            const controller = new AbortController();

            const timeout = setTimeout(() => {
                controller.abort();
            }, 1500);

            fetch(validHref, { mode: 'no-cors', signal: controller.signal })
                .then(() => {
                    clearTimeout(timeout);
                })
                .catch(() => {
                    checkForAlternative();
                });
        }
        catch (error) {
            checkForAlternative();
        }
    }, []);

    return (
        validHref
            ? <a {...{ ...props, href: validHref }}>{props.children}</a>
            : <span>{props.children}{props.invalidText ? ` (${props.invalidText})` : ''}</span>
    );
}

export default ForeverLink;