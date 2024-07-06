from flask import render_template, request, jsonify, current_app
import os

# Use current_app instead of importing app directly
app = current_app

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/create-playbook')
def create_playbook():
    return render_template('create-playbook.html')

@app.route('/add-host', methods=['POST'])
def add_host():
    data = request.json
    if data:
        new_host = data.get('new_host')
        group = data.get('group')
        if new_host and group:
            with open(os.path.join(app.root_path, 'hosts.ini'), 'a') as f:
                f.write(f'\n[{group}]\n{new_host} ansible_host={new_host}')
            return jsonify({'status': 'success'})
    return jsonify({'status': 'error', 'message': 'Invalid data'})

@app.route('/get-hosts')
def get_hosts():
    hosts = []
    with open(os.path.join(app.root_path, 'hosts.ini'), 'r') as f:
        lines = f.readlines()
        for line in lines:
            if line.strip() and not line.startswith('['):
                hosts.append(line.split()[0])
    return jsonify({'hosts': hosts})

@app.route('/run-playbook', methods=['POST'])
def run_playbook():
    data = request.json
    if data:
        playbook = data.get('playbook')
        hosts = data.get('hosts')
        # Add logic here to execute playbook using Ansible
        return jsonify({'status': 'success', 'message': f'Playbook {playbook} executed on hosts: {", ".join(hosts)}'})
    return jsonify({'status': 'error', 'message': 'Invalid data'})

@app.route('/get-playbooks')
def get_playbooks():
    playbooks = [f for f in os.listdir(app.root_path) if f.endswith('.yml')]
    return jsonify({'playbooks': playbooks})

@app.route('/get-playbook-content')
def get_playbook_content():
    playbook = request.args.get('playbook')
    if playbook:
        with open(os.path.join(app.root_path, playbook), 'r') as f:
            content = f.read()
        return content
    return ''

@app.route('/save-playbook', methods=['POST'])
def save_playbook():
    data = request.json
    if data:
        playbook = data.get('playbook')
        content = data.get('content')
        if playbook and content:
            with open(os.path.join(app.root_path, playbook), 'w') as f:
                f.write(content)
            return jsonify({'status': 'success', 'playbook': playbook})
    return jsonify({'status': 'error', 'message': 'Invalid data'})

