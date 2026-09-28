"use client";

import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Banknote,
  QrCode,
  DollarSign,
  User,
  CheckCircle2,
  Printer,
  ArrowRight,
  RotateCcw,
  Percent,
  Store,
  AlertCircle,
  Shirt,
} from "lucide-react";
import { toast } from "sonner";

import type { Product, ProductVariant, Customer, CashSession, Sale, SaleItem, StockLevel } from "@/types";
import { posService } from "@/services/pos";
import { inventoryService } from "@/services/inventory";
import { formatCurrency, formatDateTime } from "@/lib/formatters";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface CartItem extends SaleItem {
  max_stock: number;
}

export default function PosPage() {
  // Cashier Session
  const [session, setSession] = React.useState<CashSession | null>(null);
  const [loadingSession, setLoadingSession] = React.useState(true);

  // Products, Stock & Customers
  const [products, setProducts] = React.useState<Product[]>([]);
  const [stockMap, setStockMap] = React.useState<Record<string, number>>({});
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [loadingCatalog, setLoadingCatalog] = React.useState(true);

  // Search & Filter
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCategory, setSelectedCategory] = React.useState("Todos");

  // Cart State
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);
  const [customerSearch, setCustomerSearch] = React.useState("");
  const [showCustomerPicker, setShowCustomerPicker] = React.useState(false);

  // Discount
  const [discountType, setDiscountType] = React.useState<"fixed" | "percent">("fixed");
  const [discountValue, setDiscountValue] = React.useState<number>(0);

  // Variant Modal
  const [variantModalProduct, setVariantModalProduct] = React.useState<Product | null>(null);

  // Payment Modal
  const [isPaymentOpen, setIsPaymentOpen] = React.useState(false);
  const [paymentMethod, setPaymentMethod] = React.useState<"money" | "pix" | "credit_card" | "debit_card">("pix");
  const [amountReceived, setAmountReceived] = React.useState<string>("");
  const [installments, setInstallments] = React.useState<number>(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Completed Sale Receipt Modal
  const [completedSale, setCompletedSale] = React.useState<Sale | null>(null);

  // Quick Open Cash Session Modal (if closed)
  const [showOpenCashModal, setShowOpenCashModal] = React.useState(false);
  const [initialFloat, setInitialFloat] = React.useState("200.00");

  // Load session, products, stock, customers
  const loadInitialData = React.useCallback(async () => {
    try {
      const [sess, prodRes, custRes, stockList] = await Promise.all([
        posService.getActiveSession(),
        fetch("/api/products", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ products: [] })),
        fetch("/api/customers", { cache: "no-store" }).then((r) => r.json()).catch(() => ({ customers: [] })),
        inventoryService.getStockLevels(),
      ]);

      setSession(sess);
      setProducts(prodRes.products || []);
      setCustomers(custRes.customers || []);

      const sMap: Record<string, number> = {};
      (stockList || []).forEach((stk: StockLevel) => {
        sMap[stk.variant_id] = stk.current_stock;
      });
      setStockMap(sMap);
    } catch {
      toast.error("Erro ao carregar dados do PDV.");
    } finally {
      setLoadingSession(false);
      setLoadingCatalog(false);
    }
  }, []);

  React.useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Derived Categories
  const categories = React.useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      const catName = p.category?.name;
      if (catName) set.add(catName);
    });
    return ["Todos", ...Array.from(set)];
  }, [products]);

  // Filtered Products
  const filteredProducts = React.useMemo(() => {
    let list = products;
    if (selectedCategory !== "Todos") {
      list = list.filter((p) => p.category?.name === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q) ||
          p.variants?.some(
            (v) =>
              v.sku_variant.toLowerCase().includes(q) ||
              v.color.toLowerCase().includes(q) ||
              v.size.toLowerCase().includes(q)
          )
      );
    }
    return list;
  }, [products, selectedCategory, searchQuery]);

  // Cart Calculations
  const cartSubtotal = React.useMemo(() => {
    return cart.reduce((acc, item) => acc + item.total_price, 0);
  }, [cart]);

  const calculatedDiscount = React.useMemo(() => {
    if (discountValue <= 0) return 0;
    if (discountType === "percent") {
      const p = Math.min(100, Math.max(0, discountValue));
      return Number(((cartSubtotal * p) / 100).toFixed(2));
    }
    return Math.min(cartSubtotal, Math.max(0, discountValue));
  }, [cartSubtotal, discountType, discountValue]);

  const cartTotal = React.useMemo(() => {
    return Math.max(0, Number((cartSubtotal - calculatedDiscount).toFixed(2)));
  }, [cartSubtotal, calculatedDiscount]);

  // Change Calculation for Money
  const changeAmount = React.useMemo(() => {
    if (paymentMethod !== "money") return 0;
    const received = parseFloat(amountReceived.replace(",", ".")) || 0;
    return Math.max(0, Number((received - cartTotal).toFixed(2)));
  }, [paymentMethod, amountReceived, cartTotal]);

  // Add Variant directly to Cart
  const handleAddVariantToCart = (product: Product, variant: ProductVariant) => {
    const stockAvailable = stockMap[variant.id] ?? 5;
    if (stockAvailable <= 0) {
      toast.warning(`A variação Tam: ${variant.size} - Cor: ${variant.color} está sem estoque disponível.`);
    }

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.variant_id === variant.id);
      if (existingIndex > -1) {
        const item = prev[existingIndex];
        const newQty = item.quantity + 1;
        const updated = [...prev];
        updated[existingIndex] = {
          ...item,
          quantity: newQty,
          total_price: Number((newQty * item.unit_price).toFixed(2)),
        };
        return updated;
      }

      const newItem: CartItem = {
        variant_id: variant.id,
        product_id: product.id,
        product_name: product.name,
        sku_variant: variant.sku_variant,
        size: variant.size,
        color: variant.color,
        quantity: 1,
        unit_price: product.sale_price,
        discount: 0,
        total_price: product.sale_price,
        max_stock: stockAvailable,
      };
      return [...prev, newItem];
    });

    toast.success(`${product.name} (${variant.size} / ${variant.color}) adicionado ao carrinho!`);
    setVariantModalProduct(null);
  };

  // Click on product card
  const handleSelectProduct = (product: Product) => {
    if (!product.variants || product.variants.length === 0) {
      toast.error("Produto sem variações de tamanho e cor cadastradas.");
      return;
    }

    if (product.variants.length === 1) {
      handleAddVariantToCart(product, product.variants[0]);
    } else {
      setVariantModalProduct(product);
    }
  };

  // Adjust item quantity
  const handleUpdateQuantity = (variantId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.variant_id === variantId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            return {
              ...item,
              quantity: newQty,
              total_price: Number((newQty * item.unit_price).toFixed(2)),
            };
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveItem = (variantId: string) => {
    setCart((prev) => prev.filter((item) => item.variant_id !== variantId));
  };

  const handleClearCart = () => {
    if (cart.length === 0) return;
    if (confirm("Deseja realmente limpar todos os itens do carrinho?")) {
      setCart([]);
      setDiscountValue(0);
      setSelectedCustomer(null);
    }
  };

  // Open Cash Action
  const handleOpenCashSession = async () => {
    const val = parseFloat(initialFloat.replace(",", ".")) || 0;
    const res = await posService.openSession({
      initial_balance: val,
      notes: "Abertura direta pelo PDV",
    });

    if (res.session) {
      setSession(res.session);
      setShowOpenCashModal(false);
      toast.success("Caixa aberto com sucesso! Boas vendas.");
    } else {
      toast.error(res.error || "Erro ao abrir caixa.");
    }
  };

  // Checkout Finalize
  const handleConfirmSale = async () => {
    if (cart.length === 0) {
      toast.error("O carrinho está vazio.");
      return;
    }

    if (paymentMethod === "money") {
      const received = parseFloat(amountReceived.replace(",", ".")) || 0;
      if (received < cartTotal) {
        toast.error(`Valor recebido é menor que o total da venda (${formatCurrency(cartTotal)}).`);
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const res = await posService.checkoutSale({
        customer_id: selectedCustomer?.id || null,
        customer_name: selectedCustomer?.name || "Cliente Balcão",
        items: cart.map((i) => ({
          variant_id: i.variant_id,
          product_id: i.product_id,
          product_name: i.product_name,
          sku_variant: i.sku_variant,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
          unit_price: i.unit_price,
          discount: i.discount,
          total_price: i.total_price,
        })),
        subtotal: cartSubtotal,
        discount: calculatedDiscount,
        total_amount: cartTotal,
        payment_method: paymentMethod,
        amount_received:
          paymentMethod === "money" ? parseFloat(amountReceived.replace(",", ".")) || cartTotal : cartTotal,
        change_amount: changeAmount,
        installments: paymentMethod === "credit_card" ? installments : 1,
      });

      if (res.sale) {
        setCompletedSale(res.sale);
        setIsPaymentOpen(false);
        setCart([]);
        setDiscountValue(0);
        setSelectedCustomer(null);
        setAmountReceived("");
        toast.success(`Venda ${res.sale.sale_number} concluída com sucesso!`);
        // Refresh session total and inventory stock
        posService.getActiveSession().then(setSession);
        inventoryService.getStockLevels().then((stkList) => {
          const sMap: Record<string, number> = {};
          (stkList || []).forEach((stk) => {
            sMap[stk.variant_id] = stk.current_stock;
          });
          setStockMap(sMap);
        });
      } else {
        toast.error(res.error || "Não foi possível finalizar a venda.");
      }
    } catch {
      toast.error("Erro inesperado ao processar a venda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Customers Filter
  const filteredCustomers = React.useMemo(() => {
    if (!customerSearch.trim()) return customers.slice(0, 5);
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.cpf_cnpj && c.cpf_cnpj.includes(q)) ||
        (c.phone && c.phone.includes(q))
    );
  }, [customers, customerSearch]);

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] overflow-hidden">
      {/* Top Bar - Cashier Status & Shortcuts */}
      <div className="bg-white border-b border-gray-200 px-4 py-2.5 flex items-center justify-between shadow-xs z-10 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
              <Store className="h-5 w-5 text-gray-900" />
              PDV Balcão
            </span>
          </div>

          <div className="h-4 w-px bg-gray-200" />

          {/* Cash Status Indicator */}
          {loadingSession ? (
            <div className="h-6 w-36 bg-gray-100 animate-pulse rounded-full" />
          ) : session && session.status === "open" ? (
            <div className="flex items-center gap-2 text-xs">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Caixa Aberto ({session.opened_by})
              </span>
              <span className="text-gray-500 hidden sm:inline">
                Fundo: <strong className="text-gray-700">{formatCurrency(session.initial_balance)}</strong> | Vendas Hoje:{" "}
                <strong className="text-gray-900">{formatCurrency(session.total_sales)}</strong>
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">
                <AlertCircle className="w-3.5 h-3.5" />
                Caixa Fechado
              </span>
              <Button
                size="sm"
                variant="outline"
                className="h-7 text-xs border-amber-300 text-amber-800 hover:bg-amber-50"
                onClick={() => setShowOpenCashModal(true)}
              >
                Abrir Caixa
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Link href="/cash">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-600 gap-1.5">
              <DollarSign className="w-3.5 h-3.5" />
              Movimento de Caixa
            </Button>
          </Link>
          <Link href="/products/new">
            <Button variant="ghost" size="sm" className="h-8 text-xs text-gray-600 gap-1.5 hidden md:flex">
              <Plus className="w-3.5 h-3.5" />
              Novo Produto
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Split Layout: Products Left, Cart Right */}
      <div className="flex-1 flex overflow-hidden">
        {/* LEFT COLUMN: Product Catalog */}
        <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-200 bg-gray-50/50">
          {/* Search & Category Tabs */}
          <div className="p-4 bg-white border-b border-gray-200 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Pesquisar por nome da peça, SKU ou variação..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 bg-gray-50 border-gray-200 focus:bg-white text-sm"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600"
                >
                  Limpar
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 text-xs font-medium rounded-full transition-all whitespace-nowrap ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white shadow-xs"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Grid */}
          <div className="flex-1 overflow-y-auto p-4">
            {loadingCatalog ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-44 bg-gray-200 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-500">
                <Shirt className="h-12 w-12 text-gray-300 mb-3" />
                <p className="font-medium text-gray-700">Nenhum produto encontrado</p>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Verifique os termos de busca ou filtre por outra categoria.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {filteredProducts.map((product) => {
                  const totalStock = (product.variants || []).reduce(
                    (acc, v) => acc + (stockMap[v.id] ?? 5),
                    0
                  );
                  const isOutOfStock = totalStock <= 0;

                  return (
                    <button
                      key={product.id}
                      onClick={() => handleSelectProduct(product)}
                      disabled={isOutOfStock}
                      className={`group relative text-left bg-white rounded-xl border p-3 flex flex-col justify-between transition-all shadow-xs hover:shadow-md ${
                        isOutOfStock
                          ? "opacity-50 border-gray-200 cursor-not-allowed"
                          : "border-gray-200 hover:border-gray-900"
                      }`}
                    >
                      <div>
                        {/* Garment Image Placeholder or Thumbnail */}
                        <div className="aspect-square w-full rounded-lg bg-gray-100 flex items-center justify-center mb-2.5 overflow-hidden group-hover:bg-gray-50 transition-colors">
                          <Shirt className="w-8 h-8 text-gray-400 group-hover:scale-110 transition-transform" />
                        </div>

                        <div className="flex items-center gap-1.5 mb-1">
                          <span className="text-[10px] font-mono font-medium text-gray-500 uppercase">
                            {product.sku}
                          </span>
                          {product.category?.name && (
                            <span className="text-[10px] text-gray-400">• {product.category.name}</span>
                          )}
                        </div>

                        <h4 className="font-medium text-xs text-gray-900 line-clamp-2 leading-snug">
                          {product.name}
                        </h4>
                      </div>

                      <div className="mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-bold text-gray-900">
                            {formatCurrency(product.sale_price)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {isOutOfStock ? "Esgotado" : `${totalStock} em estoque`}
                          </p>
                        </div>

                        <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-colors">
                          <Plus className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Cart & Checkout (Sticky POS Register) */}
        <div className="w-96 md:w-[420px] bg-white flex flex-col border-l border-gray-200 shadow-lg flex-shrink-0">
          {/* Customer Selection Header */}
          <div className="p-3.5 border-b border-gray-200 bg-gray-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-700 flex-shrink-0">
                <User className="w-4 h-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs text-gray-500 font-medium">Cliente</p>
                <button
                  onClick={() => setShowCustomerPicker(!showCustomerPicker)}
                  className="text-xs font-semibold text-gray-900 hover:underline truncate block max-w-full text-left"
                >
                  {selectedCustomer ? selectedCustomer.name : "Cliente Balcão (Avulso)"}
                </button>
              </div>
            </div>

            {selectedCustomer ? (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-gray-500 hover:text-red-600"
                onClick={() => setSelectedCustomer(null)}
              >
                Trocar
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-[11px] bg-white border-gray-300"
                onClick={() => setShowCustomerPicker(true)}
              >
                Identificar
              </Button>
            )}
          </div>

          {/* Quick Customer Picker Dropdown */}
          {showCustomerPicker && (
            <div className="p-3 border-b border-gray-200 bg-white shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-gray-700">Buscar Cliente Cadastrado</span>
                <button
                  onClick={() => setShowCustomerPicker(false)}
                  className="text-xs text-gray-400 hover:text-gray-600"
                >
                  Fechar
                </button>
              </div>
              <Input
                placeholder="Nome, CPF ou Celular..."
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="h-8 text-xs"
                autoFocus
              />
              <div className="max-h-36 overflow-y-auto divide-y divide-gray-100">
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setShowCustomerPicker(false);
                  }}
                  className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded text-xs text-gray-600 font-medium"
                >
                  • Deixar como Cliente Balcão (Avulso)
                </button>
                {filteredCustomers.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setShowCustomerPicker(false);
                      toast.info(`Cliente ${c.name} vinculado à venda.`);
                    }}
                    className="w-full text-left py-1.5 px-2 hover:bg-gray-50 rounded flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-semibold text-gray-900">{c.name}</p>
                      <p className="text-[10px] text-gray-500">{c.phone || c.cpf_cnpj || "Sem doc"}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 p-6">
                <ShoppingCart className="w-12 h-12 text-gray-200 mb-2 stroke-1" />
                <p className="text-sm font-medium text-gray-500">Carrinho vazio</p>
                <p className="text-xs text-gray-400 mt-1 max-w-[200px]">
                  Clique nas peças ao lado para adicionar ao pedido.
                </p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.variant_id}
                  className="bg-gray-50/70 border border-gray-200 rounded-lg p-2.5 flex items-start gap-2.5"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-semibold text-gray-900 truncate">{item.product_name}</h5>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] px-1.5 py-0.5 bg-gray-200 rounded font-bold text-gray-700">
                        Tam: {item.size}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 bg-white border border-gray-200 rounded text-gray-600">
                        {item.color}
                      </span>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {formatCurrency(item.unit_price)} un
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-md p-0.5">
                    <button
                      onClick={() => handleUpdateQuantity(item.variant_id, -1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-5 text-center text-gray-800">{item.quantity}</span>
                    <button
                      onClick={() => handleUpdateQuantity(item.variant_id, 1)}
                      className="w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-900 rounded"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Item Total & Remove */}
                  <div className="text-right flex flex-col items-end justify-between h-full">
                    <span className="text-xs font-bold text-gray-900">
                      {formatCurrency(item.total_price)}
                    </span>
                    <button
                      onClick={() => handleRemoveItem(item.variant_id)}
                      className="text-gray-400 hover:text-red-500 p-0.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart Financial Footer */}
          <div className="border-t border-gray-200 bg-gray-50/80 p-4 space-y-3">
            {/* Discount Row */}
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-600 font-medium flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-gray-400" />
                Desconto:
              </span>
              <div className="flex items-center gap-1.5">
                <div className="flex rounded-md border border-gray-300 bg-white overflow-hidden">
                  <button
                    onClick={() => setDiscountType("fixed")}
                    className={`px-2 py-0.5 text-[10px] font-bold ${
                      discountType === "fixed" ? "bg-gray-900 text-white" : "text-gray-600"
                    }`}
                  >
                    R$
                  </button>
                  <button
                    onClick={() => setDiscountType("percent")}
                    className={`px-2 py-0.5 text-[10px] font-bold ${
                      discountType === "percent" ? "bg-gray-900 text-white" : "text-gray-600"
                    }`}
                  >
                    %
                  </button>
                </div>
                <Input
                  type="number"
                  min={0}
                  step={discountType === "fixed" ? 1 : 5}
                  value={discountValue || ""}
                  onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-16 h-7 text-xs text-right bg-white"
                />
              </div>
            </div>

            {/* Calculations Breakdown */}
            <div className="space-y-1 text-xs text-gray-600 pt-1 border-t border-gray-200">
              <div className="flex justify-between">
                <span>Subtotal ({cart.reduce((a, b) => a + b.quantity, 0)} itens):</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              {calculatedDiscount > 0 && (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <span>Desconto aplicado:</span>
                  <span>- {formatCurrency(calculatedDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between items-baseline pt-1.5 border-t border-gray-200 text-gray-900 font-bold text-base">
                <span>Total a Pagar:</span>
                <span className="text-xl text-gray-950 font-black tracking-tight">
                  {formatCurrency(cartTotal)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-4 gap-2 pt-1">
              <Button
                variant="outline"
                onClick={handleClearCart}
                disabled={cart.length === 0}
                className="col-span-1 h-11 text-xs border-gray-300 text-gray-600 hover:bg-gray-100"
                title="Limpar Carrinho"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>

              <Button
                disabled={cart.length === 0}
                onClick={() => setIsPaymentOpen(true)}
                className="col-span-3 h-11 bg-gray-950 hover:bg-black text-white font-bold text-sm tracking-wide gap-2 shadow-xs"
              >
                <span>Cobrar / Finalizar</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* VARIANT SELECTOR MODAL (Size / Color selection) */}
      {variantModalProduct && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden border border-gray-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-gray-900">{variantModalProduct.name}</h3>
                <p className="text-xs text-gray-500">Selecione o tamanho e cor desejados</p>
              </div>
              <button
                onClick={() => setVariantModalProduct(null)}
                className="text-gray-400 hover:text-gray-700 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            <div className="p-4 space-y-3 max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {variantModalProduct.variants?.map((v) => {
                  const stock = stockMap[v.id] ?? 5;
                  const outOfStock = stock <= 0;
                  return (
                    <button
                      key={v.id}
                      onClick={() => handleAddVariantToCart(variantModalProduct, v)}
                      disabled={outOfStock}
                      className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${
                        outOfStock
                          ? "bg-gray-50 border-gray-200 opacity-50 cursor-not-allowed"
                          : "bg-white border-gray-200 hover:border-gray-900 hover:shadow-xs"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-lg bg-gray-900 text-white font-bold flex items-center justify-center text-xs">
                          {v.size}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-gray-900">{v.color}</p>
                          <p className="text-[10px] text-gray-500 font-mono">{v.sku_variant}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <Badge
                          variant={outOfStock ? "outline" : "secondary"}
                          className={`text-[10px] ${
                            outOfStock
                              ? "text-red-600 border-red-200"
                              : stock <= 2
                              ? "bg-amber-100 text-amber-800"
                              : "bg-emerald-50 text-emerald-700 border-emerald-200"
                          }`}
                        >
                          {outOfStock ? "Sem estoque" : `${stock} disponíveis`}
                        </Badge>
                        <p className="text-xs font-bold text-gray-900 mt-0.5">
                          {formatCurrency(variantModalProduct.sale_price)}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-3 bg-gray-50 border-t border-gray-200 flex justify-end">
              <Button variant="outline" size="sm" onClick={() => setVariantModalProduct(null)}>
                Cancelar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {isPaymentOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="p-5 bg-gray-950 text-white flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase tracking-wider text-gray-400 font-semibold">
                  Fechamento de Venda
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white mt-0.5">
                  {formatCurrency(cartTotal)}
                </h3>
              </div>
              <button
                onClick={() => setIsPaymentOpen(false)}
                className="text-gray-400 hover:text-white text-sm p-1"
              >
                ✕
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: "pix", label: "PIX", icon: QrCode },
                  { id: "credit_card", label: "Crédito", icon: CreditCard },
                  { id: "debit_card", label: "Débito", icon: CreditCard },
                  { id: "money", label: "Dinheiro", icon: Banknote },
                ].map((m) => {
                  const Icon = m.icon;
                  const active = paymentMethod === m.id;
                  return (
                    <button
                      key={m.id}
                      onClick={() =>
                        setPaymentMethod(m.id as "money" | "pix" | "credit_card" | "debit_card")
                      }
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all text-xs font-semibold ${
                        active
                          ? "bg-gray-900 text-white border-gray-900 shadow-xs"
                          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* PAYMENT DETAILS BY METHOD */}

              {/* 1. DINHEIRO */}
              {paymentMethod === "money" && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <div>
                    <label className="text-xs font-semibold text-gray-700 block mb-1">
                      Valor Entregue pelo Cliente:
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-gray-400 text-sm">
                        R$
                      </span>
                      <Input
                        type="text"
                        placeholder={cartTotal.toFixed(2)}
                        value={amountReceived}
                        onChange={(e) => setAmountReceived(e.target.value)}
                        className="pl-9 h-11 text-base font-bold bg-white"
                        autoFocus
                      />
                    </div>
                  </div>

                  {/* Quick Cash Buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {[cartTotal, 50, 100, 150, 200].map((amt) => (
                      <button
                        key={amt}
                        onClick={() => setAmountReceived(amt.toFixed(2))}
                        className="px-2.5 py-1 text-xs font-medium bg-white border border-gray-200 rounded-md hover:bg-gray-100 text-gray-700"
                      >
                        {formatCurrency(amt)}
                      </button>
                    ))}
                  </div>

                  {/* Change Preview */}
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-emerald-900">
                    <span className="text-xs font-semibold">Troco a Devolver:</span>
                    <span className="text-lg font-black">{formatCurrency(changeAmount)}</span>
                  </div>
                </div>
              )}

              {/* 2. PIX */}
              {paymentMethod === "pix" && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center">
                  <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl border border-gray-200 shadow-xs flex items-center justify-center">
                    <QrCode className="w-24 h-24 text-gray-900" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-900">Chave PIX DALA Boutique</p>
                    <p className="text-xs text-gray-500 font-mono mt-0.5">pix@dalaboutique.com.br</p>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Aguardando confirmação do pagamento instantâneo pelo aplicativo do cliente.
                  </p>
                </div>
              )}

              {/* 3. CARTÃO DE CRÉDITO */}
              {paymentMethod === "credit_card" && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200">
                  <label className="text-xs font-semibold text-gray-700 block mb-1">
                    Número de Parcelas:
                  </label>
                  <select
                    value={installments}
                    onChange={(e) => setInstallments(parseInt(e.target.value))}
                    className="w-full h-11 px-3 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                      <option key={n} value={n}>
                        {n}x de {formatCurrency(cartTotal / n)} sem juros
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-gray-500">
                    Insira ou aproxime o cartão na maquininha TEF/POS.
                  </p>
                </div>
              )}

              {/* 4. CARTÃO DE DÉBITO */}
              {paymentMethod === "debit_card" && (
                <div className="space-y-3 bg-gray-50 p-4 rounded-xl border border-gray-200 text-center py-6">
                  <CreditCard className="w-10 h-10 text-gray-700 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-900">Pagamento no Débito à Vista</p>
                  <p className="text-[11px] text-gray-500 max-w-xs mx-auto">
                    Aguardando aprovação da transação de {formatCurrency(cartTotal)} na maquininha.
                  </p>
                </div>
              )}

              {/* Customer summary */}
              <div className="text-xs text-gray-500 flex justify-between px-1">
                <span>Cliente: {selectedCustomer ? selectedCustomer.name : "Cliente Balcão"}</span>
                <span>{cart.length} itens</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-2">
              <Button variant="outline" onClick={() => setIsPaymentOpen(false)} disabled={isSubmitting}>
                Voltar
              </Button>
              <Button
                onClick={handleConfirmSale}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 h-10"
              >
                {isSubmitting ? "Processando..." : "Confirmar e Concluir Venda"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* COMPLETED SALE RECEIPT MODAL (Comprovante / Cupom Não-Fiscal) */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full shadow-2xl border border-gray-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Printable Receipt Area */}
            <div id="dala-receipt" className="p-6 font-mono text-xs text-gray-800 space-y-4">
              <div className="text-center border-b border-dashed border-gray-300 pb-3">
                <h2 className="font-bold text-base tracking-widest text-gray-900 uppercase">
                  DALA BOUTIQUE
                </h2>
                <p className="text-[10px] text-gray-500 mt-0.5">Moda Feminina & Masculina</p>
                <p className="text-[10px] text-gray-400">CNPJ: 12.345.678/0001-90</p>
                <p className="text-[10px] text-gray-400">Rua das Flores, 100 - Centro</p>
              </div>

              <div className="text-[11px] space-y-0.5">
                <div className="flex justify-between">
                  <span>CUPOM:</span>
                  <strong>{completedSale.sale_number}</strong>
                </div>
                <div className="flex justify-between">
                  <span>DATA:</span>
                  <span>{formatDateTime(completedSale.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CLIENTE:</span>
                  <span className="truncate max-w-[160px]">
                    {completedSale.customer_name || "Consumidor Final"}
                  </span>
                </div>
              </div>

              {/* Items Table */}
              <div className="border-t border-b border-dashed border-gray-300 py-2 space-y-1.5">
                <div className="flex justify-between text-[10px] font-bold text-gray-500 uppercase">
                  <span>Item / Tam / Cor</span>
                  <span>Qtd x Total</span>
                </div>
                {completedSale.items.map((it, idx) => (
                  <div key={idx} className="text-[11px]">
                    <div className="font-bold text-gray-900 truncate">{it.product_name}</div>
                    <div className="flex justify-between text-gray-600 text-[10px]">
                      <span>
                        Tam: {it.size} | Cor: {it.color}
                      </span>
                      <span>
                        {it.quantity} x {formatCurrency(it.unit_price)} = {formatCurrency(it.total_price)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(completedSale.subtotal)}</span>
                </div>
                {completedSale.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Desconto:</span>
                    <span>- {formatCurrency(completedSale.discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-black text-gray-900 pt-1 border-t border-gray-200">
                  <span>TOTAL PAGO:</span>
                  <span>{formatCurrency(completedSale.total_amount)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-[10px]">
                  <span>Forma:</span>
                  <span className="uppercase font-bold">{completedSale.payment_method}</span>
                </div>
                {completedSale.change_amount && completedSale.change_amount > 0 ? (
                  <div className="flex justify-between text-gray-600 text-[10px]">
                    <span>Troco:</span>
                    <span>{formatCurrency(completedSale.change_amount)}</span>
                  </div>
                ) : null}
              </div>

              <div className="text-center border-t border-dashed border-gray-300 pt-3 text-[10px] text-gray-500">
                <p>Trocas em até 30 dias com etiquetas intactas.</p>
                <p className="mt-1 font-bold text-gray-800">Obrigado pela preferência!</p>
              </div>
            </div>

            {/* Receipt Modal Buttons */}
            <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs"
                onClick={() => window.print()}
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir
              </Button>
              <Button
                size="sm"
                className="bg-gray-900 text-white text-xs gap-1.5"
                onClick={() => setCompletedSale(null)}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Nova Venda
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* OPEN CASH REGISTER MODAL (Prompt when register is closed) */}
      {showOpenCashModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-gray-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-sm">Abertura de Caixa</h3>
                <p className="text-xs text-gray-500">Informe o fundo de troco para iniciar o turno.</p>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">
                Fundo de Caixa Inicial (R$):
              </label>
              <Input
                type="text"
                value={initialFloat}
                onChange={(e) => setInitialFloat(e.target.value)}
                placeholder="200.00"
                className="h-10 text-sm font-bold"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" size="sm" onClick={() => setShowOpenCashModal(false)}>
                Cancelar
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                onClick={handleOpenCashSession}
              >
                Abrir Caixa Agora
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
