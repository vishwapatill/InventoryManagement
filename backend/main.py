from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
from datetime import datetime
from PIL import Image, ImageDraw, ImageFont
import uuid

app = Flask(__name__)
CORS(app)

# -----------------------------------
# File paths and setup
# -----------------------------------
INVENTORY_FILE = 'inventory.json'
SOLD_PRODUCTS_FILE = 'products_sold.json'
BILLING_HISTORY_FILE = 'billing_history.json'

# Initialize files if missing
for file, default_content in [
    (INVENTORY_FILE, {'admin': {}, 'items': []}),
    (SOLD_PRODUCTS_FILE, []),
    (BILLING_HISTORY_FILE, [])
]:
    if not os.path.exists(file):
        with open(file, 'w') as f:
            json.dump(default_content, f, indent=4)

# -----------------------------------
# Helper Functions
# -----------------------------------
def load_json(path):
    with open(path, 'r') as f:
        return json.load(f)


def save_json(path, data):
    with open(path, 'w') as f:
        json.dump(data, f, indent=4)


def load_inventory():
    return load_json(INVENTORY_FILE)


def save_inventory(data):
    save_json(INVENTORY_FILE, data)


def load_sold_products():
    return load_json(SOLD_PRODUCTS_FILE)


def save_sold_products(data):
    save_json(SOLD_PRODUCTS_FILE, data)


def load_billing_history():
    return load_json(BILLING_HISTORY_FILE)


def save_billing_history(data):
    save_json(BILLING_HISTORY_FILE, data)


# -----------------------------------
# Inventory Management
# -----------------------------------
def add_new_item(name, desc, price, initial_quantity=0):
    inventory = load_inventory()
    if any(i['name'].lower() == name.lower() for i in inventory['items']):
        return {'error': 'Item already exists'}, 400

    new_item = {
        'pid': str(uuid.uuid4())[:8],
        'name': name,
        'description': desc,
        'price': float(price),
        'quantity': int(initial_quantity)
    }
    inventory['items'].append(new_item)
    save_inventory(inventory)
    return {'message': 'Item added successfully', 'item': new_item}, 201


def update_item(pid, desc=None, price=None, quantity=None):
    inventory = load_inventory()
    for item in inventory['items']:
        if item['pid'] == pid:
            if desc is not None:
                item['description'] = desc
            if price is not None:
                item['price'] = float(price)
            if quantity is not None:
                item['quantity'] = int(quantity)
            save_inventory(inventory)
            return {'message': 'Item updated successfully', 'item': item}, 200
    return {'error': 'Item not found'}, 404


def decrease_count(pid, qty):
    inventory = load_inventory()
    for item in inventory['items']:
        if item['pid'] == pid:
            if item['quantity'] < qty:
                return {'error': 'Insufficient stock'}, 400
            item['quantity'] -= qty
            save_inventory(inventory)
            return {'message': 'Stock updated successfully'}, 200
    return {'error': 'Item not found'}, 404


def log_sold_product(pid, quantity, prod):
    sold_products = load_sold_products()
    sold_products.append({
        'pid': pid,
        'product': prod,
        'quantity': quantity,
        'timestamp': datetime.now().isoformat()
    })
    save_sold_products(sold_products)


# -----------------------------------
# Invoice Generation
# -----------------------------------
def generate_invoice_image(invoice_data):
    img = Image.new('RGB', (600, 800), color=(255, 255, 255))
    d = ImageDraw.Draw(img)
    font = ImageFont.load_default()

    # Header
    d.text((10, 10), "🧾 Invoice", fill=(0, 0, 0), font=font)
    d.text((10, 30), f"Date: {invoice_data['date']}", fill=(0, 0, 0), font=font)
    d.text((10, 50), f"Payment Method: {invoice_data['payment_method']}", fill=(0, 0, 0), font=font)
    d.text((10, 70), f"Invoice ID: {invoice_data['invoice_id']}", fill=(0, 0, 0), font=font)

    # Items
    y = 110
    d.text((10, y - 10), "Items:", fill=(0, 0, 0), font=font)
    for item in invoice_data['items']:
        d.text((10, y), f"{item['name']} x {item['quantity']} = ₹{item['subtotal']:.2f}", fill=(0, 0, 0), font=font)
        y += 20

    # Totals
    y += 20
    d.text((10, y), f"Subtotal: ₹{invoice_data['subtotal']:.2f}", fill=(0, 0, 0), font=font)
    d.text((10, y + 20), f"GST (18%): ₹{invoice_data['gst']:.2f}", fill=(0, 0, 0), font=font)
    d.text((10, y + 40), f"Additional Tax (2%): ₹{invoice_data['additional_tax']:.2f}", fill=(0, 0, 0), font=font)
    d.text((10, y + 60), f"Discount: -₹{invoice_data['discount']:.2f}", fill=(0, 0, 0), font=font)
    d.text((10, y + 80), f"Total Payable: ₹{invoice_data['total']:.2f}", fill=(0, 0, 0), font=font)

    # Save file
    filename = f"invoices/invoice_{invoice_data['invoice_id']}.png"
    os.makedirs("invoices", exist_ok=True)
    img.save(filename)
    return filename


# -----------------------------------
# Flask Routes
# -----------------------------------
@app.route('/inventory', methods=['GET'])
def get_inventory():
    return jsonify(load_inventory()['items'])


@app.route('/inventory/add', methods=['POST'])
def route_add_item():
    data = request.json
    return add_new_item(data['name'], data['desc'], data['price'], data.get('quantity', 0))


@app.route('/inventory/update/<pid>', methods=['PUT'])
def route_update_item(pid):
    data = request.json
    return update_item(pid, data.get('desc'), data.get('price'), data.get('quantity'))


@app.route('/cart/add', methods=['POST'])
def add_to_cart():
    data = request.json
    pid = data.get('pid')
    quantity = int(data.get('quantity', 1))

    inventory = load_inventory()
    item = next((i for i in inventory['items'] if i['pid'] == pid), None)
    if not item:
        return jsonify({'error': 'Item not found'}), 404
    if item['quantity'] < quantity:
        return jsonify({'error': 'Insufficient stock'}), 400

    subtotal = item['price'] * quantity
    cart_item = {'pid': pid, 'name': item['name'], 'quantity': quantity, 'subtotal': subtotal}
    return jsonify({'message': f'Added {quantity} x {item["name"]}', 'cart_item': cart_item})


@app.route('/checkout', methods=['POST'])
def checkout():
    data = request.json
    payment_method = data.get('payment_method')
    cart_items = data.get('cart_items', [])

    if not cart_items:
        return jsonify({'error': 'Cart is empty'}), 400

    invoice_id = str(uuid.uuid4())[:8]
    for item in cart_items:
        pid = item['pid']
        qty = item['quantity']
        prod = item['name']
        decrease_count(pid, qty)
        log_sold_product(pid, qty, prod)

    subtotal = sum(i['subtotal'] for i in cart_items)
    gst = subtotal * 0.18
    additional_tax = subtotal * 0.02
    discount = 0
    total = subtotal + gst + additional_tax - discount

    invoice_data = {
        'invoice_id': invoice_id,
        'date': datetime.now().strftime('%d-%m-%Y %H:%M:%S'),
        'payment_method': payment_method,
        'items': cart_items,
        'subtotal': subtotal,
        'gst': gst,
        'additional_tax': additional_tax,
        'discount': discount,
        'total': total
    }

    # Save full bill info in history
    history = load_billing_history()
    history.append(invoice_data)
    save_billing_history(history)

    # Generate invoice image
    img_path = generate_invoice_image(invoice_data)
    return send_file(img_path, mimetype='image/png')


@app.route('/billing/history', methods=['GET'])
def get_billing_history():
    """Return all stored invoices"""
    return jsonify(load_billing_history())


@app.route('/billing/<invoice_id>', methods=['GET'])
def get_invoice(invoice_id):
    """Fetch invoice by ID and regenerate image"""
    history = load_billing_history()
    invoice = next((inv for inv in history if inv['invoice_id'] == invoice_id), None)
    if not invoice:
        return jsonify({'error': 'Invoice not found'}), 404

    img_path = generate_invoice_image(invoice)
    return send_file(img_path, mimetype='image/png')

@app.route('/analysis', methods=['GET'])
def sales_analysis():
    start_date = request.args.get('start')
    end_date = request.args.get('end')

    sold_products = load_sold_products()
    item_sales = {}

    # Convert date strings to datetime for filtering
    def parse_date(s):
        try:
            return datetime.fromisoformat(s)
        except:
            return None

    start_dt = datetime.fromisoformat(start_date) if start_date else None
    end_dt = datetime.fromisoformat(end_date) if end_date else None

    for sale in sold_products:
        ts = parse_date(sale['timestamp'])
        if ts is None:
            continue
        if start_dt and ts < start_dt:
            continue
        if end_dt and ts > end_dt:
            continue

        name = sale.get('product', 'Unknown')
        qty = int(sale.get('quantity', 0))
        item_sales[name] = item_sales.get(name, 0) + qty

    # Sort top 10
    sorted_items = sorted(item_sales.items(), key=lambda x: x[1], reverse=True)[:10]

    labels = [i[0] for i in sorted_items]
    data = [i[1] for i in sorted_items]

    return jsonify({'labels': labels, 'data': data})
@app.route("/hello", methods=["POST"])
def hello():
    req = request.json
    print(req)
    return jsonify({'msg': 'hello'})


# -----------------------------------
# Run Server
# -----------------------------------
if __name__ == '__main__':
    app.run(debug=True)
