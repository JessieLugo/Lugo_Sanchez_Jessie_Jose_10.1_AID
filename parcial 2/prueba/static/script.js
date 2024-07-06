document.addEventListener('DOMContentLoaded', function() {
    fetchPlaybooks();
    fetchHosts();

    const socket = io();

    socket.on('playbook_log', function(msg) {
        const processOutput = document.getElementById('process-output');
        processOutput.textContent += msg.data + '\n';
        processOutput.scrollTop = processOutput.scrollHeight;
    });
});

function fetchPlaybooks() {
    fetch('/api/playbooks')
        .then(response => response.json())
        .then(data => {
            // Verificar si estamos en la página de index.html
            const playbookList = document.getElementById('playbook-list');
            if (playbookList) {
                data.playbooks.forEach(playbook => {
                    let option = document.createElement('option');
                    option.value = playbook;
                    option.text = playbook;
                    playbookList.appendChild(option);
                });
            }

            // Verificar si estamos en la página de create-playbook.html
            const playbookSelect = document.getElementById('existing-playbooks');
            if (playbookSelect) {
                data.playbooks.forEach(playbook => {
                    let option = document.createElement('option');
                    option.value = playbook;
                    option.text = playbook;
                    playbookSelect.appendChild(option);
                });
            }
        });
}

function fetchHosts() {
    fetch('/get-hosts')
        .then(response => response.json())
        .then(data => {
            const hostList = document.getElementById('host-list');
            if (hostList) {
                data.hosts.forEach(host => {
                    let checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.value = host;
                    checkbox.id = host;

                    let label = document.createElement('label');
                    label.htmlFor = host;
                    label.textContent = host;

                    hostList.appendChild(checkbox);
                    hostList.appendChild(label);
                });
            }
        });
}

function addHost(event) {
    event.preventDefault();
    const newHost = document.getElementById('new-host').value;
    if (!newHost) {
        alert('Por favor ingresa una dirección de host.');
        return;
    }

    fetch('/add-host', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ new_host: newHost, group: 'all' }),
    })
    .then(response => response.json())
    .then(data => {
        if (data.status === 'success') {
            let checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.value = newHost;
            checkbox.id = newHost;

            let label = document.createElement('label');
            label.htmlFor = newHost;
            label.textContent = newHost;

            document.getElementById('host-list').appendChild(checkbox);
            document.getElementById('host-list').appendChild(label);
            document.getElementById('new-host').value = '';
        }
    });
}

function startPlaybook() {
    const playbook = document.getElementById('playbook-list').value;
    const selectedHosts = Array.from(document.querySelectorAll('#host-list input:checked')).map(cb => cb.value);
    fetch('/run-playbook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playbook: playbook, hosts: selectedHosts }),
    })
    .then(response => response.json())
    .then(data => {
        console.log(data.message);
    });
}

function loadPlaybookContent() {
    const playbookName = document.getElementById('existing-playbooks').value;
    if (playbookName) {
        fetch(`/api/playbook_content?name=${playbookName}`)
            .then(response => response.json())
            .then(data => {
                document.getElementById('playbook-name').value = data.name.replace('.yml', '');
                document.getElementById('playbook-content').value = data.content;
            });
    } else {
        document.getElementById('playbook-name').value = '';
        document.getElementById('playbook-content').value = '';
    }
}

function savePlaybook(event) {
    event.preventDefault();
    const playbookContent = document.getElementById('playbook-content').value;
    const playbookNameInput = document.getElementById('playbook-name');
    const playbookSelect = document.getElementById('existing-playbooks');
    const playbook = playbookNameInput.value || playbookSelect.value;

    if (!playbook) {
        alert('Por favor ingresa un nombre para el nuevo playbook o selecciona un playbook existente.');
        return;
    }

    fetch('/api/save_playbook', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: playbook, content: playbookContent }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Playbook guardado:', data);
        if (!playbookSelect.value) {
            let option = document.createElement('option');
            option.value = data.playbook;
            option.textContent = data.playbook;
            playbookSelect.appendChild(option);
            playbookSelect.value = data.playbook;
        }
        playbookNameInput.value = ''; // Clear new playbook name after saving
    });
}

